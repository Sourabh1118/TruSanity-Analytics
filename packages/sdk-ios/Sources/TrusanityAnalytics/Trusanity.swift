import Foundation
import UIKit
import os.log

public class TrusanityAnalytics {
    public static let shared = TrusanityAnalytics()
    
    private var projectId: String?
    private var apiHost: String = "https://api.trusanityanalytics.com"
    private var sessionId: String?
    private var anonymousId: String?
    private var eventQueue: [[String: Any]] = []
    
    private let queueKey = "trusanity_event_queue"
    private let anonKey = "trusanity_anon_id"
    private let sessionKey = "trusanity_session_id"
    private let lock = NSLock()
    private var isFlushing = false
    
    private let logger = OSLog(subsystem: "com.trusanity.analytics", category: "SDK")
    
    private init() {
        // Initialization happens in configure()
    }
    
    public func configure(projectId: String, apiHost: String? = nil) {
        self.projectId = projectId
        if let host = apiHost {
            self.apiHost = host
        }
        
        initIdentities()
        loadQueue()
        setupLifecycleTracking()
        
        os_log("Trusanity Analytics initialized.", log: self.logger, type: .info)
    }
    
    private func initIdentities() {
        if let savedAnon = UserDefaults.standard.string(forKey: anonKey) {
            anonymousId = savedAnon
        } else {
            let newAnon = "ios_anon_\(UUID().uuidString.replacingOccurrences(of: "-", with: "").prefix(15))"
            UserDefaults.standard.set(newAnon, forKey: anonKey)
            anonymousId = newAnon
        }
        
        if let savedSess = UserDefaults.standard.string(forKey: sessionKey) {
            sessionId = savedSess
        } else {
            let newSess = "ios_sess_\(UUID().uuidString.replacingOccurrences(of: "-", with: "").prefix(15))"
            UserDefaults.standard.set(newSess, forKey: sessionKey)
            sessionId = newSess
        }
    }
    
    // MARK: - Core Tracking
    
    public func track(_ eventName: String, properties: [String: Any]? = nil) {
        let timestamp = ISO8601DateFormatter().string(from: Date())
        var mergedProperties: [String: Any] = properties ?? [:]
        
        mergedProperties["os"] = "iOS"
        mergedProperties["osVersion"] = UIDevice.current.systemVersion
        mergedProperties["deviceModel"] = UIDevice.current.model
        
        var event: [String: Any] = [
            "name": eventName,
            "timestamp": timestamp,
            "platform": "ios",
            "properties": mergedProperties
        ]
        
        if let sessId = sessionId { event["session_id"] = sessId }
        if let anonId = anonymousId { event["anonymous_id"] = anonId }
        
        lock.lock()
        eventQueue.append(event)
        saveQueue()
        lock.unlock()
        
        scheduleFlush()
    }
    
    public func identify(userId: String, traits: [String: Any]? = nil) {
        var mergedTraits = traits ?? [:]
        mergedTraits["user_id"] = userId
        track("$identify", properties: mergedTraits)
    }
    
    // MARK: - Queue Management
    
    private func loadQueue() {
        if let data = UserDefaults.standard.data(forKey: queueKey),
           let saved = try? JSONSerialization.jsonObject(with: data, options: []) as? [[String: Any]] {
            eventQueue = saved
        }
    }
    
    private func saveQueue() {
        if let data = try? JSONSerialization.data(withJSONObject: eventQueue, options: []) {
            UserDefaults.standard.set(data, forKey: queueKey)
        }
    }
    
    // MARK: - Network Dispatch
    
    private func flush() {
        guard let projId = projectId else {
            os_log("Trusanity Analytics Error: Cannot flush without a projectId. Call configure() first.", log: self.logger, type: .error)
            return
        }
        
        lock.lock()
        if eventQueue.isEmpty || isFlushing {
            lock.unlock()
            return
        }
        
        isFlushing = true
        let batch = Array(eventQueue)
        lock.unlock()
        
        let payload: [String: Any] = [
            "projectId": projId,
            "events": batch
        ]
        
        guard let url = URL(string: "\(apiHost)/v1/ingest"),
              let httpBody = try? JSONSerialization.data(withJSONObject: payload, options: []) else {
            isFlushing = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = httpBody
        
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let error = error {
                os_log("Network error flushing events: %{public}@", log: self.logger, type: .error, error.localizedDescription)
            } else if let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) {
                // Success: remove sent events
                self.lock.lock()
                // Safely remove the batch we just sent
                if self.eventQueue.count >= batch.count {
                    self.eventQueue.removeFirst(batch.count)
                    self.saveQueue()
                }
                self.lock.unlock()
            } else {
                let status = (response as? HTTPURLResponse)?.statusCode ?? 0
                os_log("Failed to flush Trusanity events. Status: %id", log: self.logger, type: .error, status)
            }
            
            self.lock.lock()
            self.isFlushing = false
            self.lock.unlock()
        }
        task.resume()
    }
    
    private func scheduleFlush() {
        lock.lock()
        let size = eventQueue.count
        lock.unlock()
        
        if size >= 10 {
            flush()
        } else {
            DispatchQueue.global().asyncAfter(deadline: .now() + 3.0) { [weak self] in
                self?.flush()
            }
        }
    }
    
    // MARK: - Lifecycle Tracking
    
    private func setupLifecycleTracking() {
        NotificationCenter.default.addObserver(self, selector: #selector(appDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appDidEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
    }
    
    @objc private func appDidBecomeActive() {
        track("$session_resume")
        flush()
    }
    
    @objc private func appDidEnterBackground() {
        track("$session_background")
        lock.lock()
        saveQueue()
        lock.unlock()
    }
}
