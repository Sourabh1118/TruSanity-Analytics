package com.trusanity.analytics

import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.Executors

class Trusanity private constructor(
    private val context: Context,
    private val projectId: String,
    private val apiHost: String
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("trusanity_prefs", Context.MODE_PRIVATE)
    private val client = OkHttpClient()
    private val executor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    private var sessionId: String? = null
    private var anonymousId: String? = null
    private var isFlushing = false
    
    // In a real SDK, this would be a SQLite Room DB for true durability.
    // For MVP, we serialize a JSON array to SharedPreferences for offline caching.
    private var eventQueue: MutableList<JSONObject> = mutableListOf()

    init {
        initIdentities()
        loadQueue()
        setupLifecycleTracking()
    }

    private fun initIdentities() {
        anonymousId = prefs.getString("anon_id", null)
        if (anonymousId == null) {
            anonymousId = "and_anon_" + UUID.randomUUID().toString().replace("-", "").take(15)
            prefs.edit().putString("anon_id", anonymousId).apply()
        }

        sessionId = prefs.getString("session_id", null)
        if (sessionId == null) {
            sessionId = "and_sess_" + UUID.randomUUID().toString().replace("-", "").take(15)
            prefs.edit().putString("session_id", sessionId).apply()
        }
    }

    private fun loadQueue() {
        val savedQueue = prefs.getString("event_queue", "[]")
        try {
            val array = JSONArray(savedQueue)
            for (i in 0 until array.length()) {
                eventQueue.add(array.getJSONObject(i))
            }
        } catch (e: Exception) {
            Log.e("Trusanity", "Failed to load offline queue")
        }
    }

    private fun saveQueue() {
        val array = JSONArray()
        eventQueue.forEach { array.put(it) }
        prefs.edit().putString("event_queue", array.toString()).apply()
    }

    fun track(eventName: String, properties: Map<String, Any> = emptyMap()) {
        executor.execute {
            try {
                val event = JSONObject()
                event.put("name", eventName)
                
                val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
                sdf.timeZone = TimeZone.getTimeZone("UTC")
                event.put("timestamp", sdf.format(Date()))
                
                event.put("session_id", sessionId)
                event.put("anonymous_id", anonymousId)
                event.put("platform", "android")

                val propsObj = JSONObject()
                properties.forEach { (k, v) -> propsObj.put(k, v) }
                propsObj.put("os", "Android")
                propsObj.put("osVersion", android.os.Build.VERSION.RELEASE)
                propsObj.put("deviceModel", android.os.Build.MODEL)
                
                event.put("properties", propsObj)

                eventQueue.add(event)
                saveQueue()
                
                scheduleFlush()
            } catch (e: Exception) {
                Log.e("Trusanity", "Error creating event: ${e.message}")
            }
        }
    }

    fun identify(userId: String, traits: Map<String, Any> = emptyMap()) {
        val props = traits.toMutableMap()
        props["user_id"] = userId
        track("\$identify", props)
    }

    @Synchronized
    private fun flush() {
        if (eventQueue.isEmpty() || isFlushing) return
        isFlushing = true

        val flushBatch = eventQueue.toList()
        
        executor.execute {
            try {
                val payload = JSONObject()
                payload.put("projectId", projectId)
                
                val eventsArray = JSONArray()
                flushBatch.forEach { eventsArray.put(it) }
                payload.put("events", eventsArray)

                val body = payload.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
                
                val request = Request.Builder()
                    .url("$apiHost/v1/ingest")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        // Remove successfully sent events
                        eventQueue.removeAll(flushBatch)
                        saveQueue()
                    } else {
                        Log.w("Trusanity", "Failed to send events, status: ${response.code}")
                    }
                }
            } catch (e: IOException) {
                Log.w("Trusanity", "Network offline, events buffered in SQLite/Prefs: ${e.message}")
            } finally {
                isFlushing = false
            }
        }
    }

    private fun scheduleFlush() {
        if (eventQueue.size >= 10) {
            flush()
        } else {
            mainHandler.postDelayed({ flush() }, 3000)
        }
    }

    private fun setupLifecycleTracking() {
        val app = context.applicationContext as? Application
        app?.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
            private var activeActivities = 0

            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
            override fun onActivityStarted(activity: Activity) {}

            override fun onActivityResumed(activity: Activity) {
                if (activeActivities == 0) {
                    track("\$session_resume")
                    flush() // Try flushing offline events when app comes to foreground
                }
                activeActivities++
                
                // Auto screen tracking
                track("\$screen_view", mapOf("screen_name" to activity.javaClass.simpleName))
            }

            override fun onActivityPaused(activity: Activity) {
                activeActivities--
                if (activeActivities == 0) {
                    track("\$session_background")
                    executor.execute { saveQueue() } // Ensure queue is flushed to disk before suspension
                }
            }

            override fun onActivityStopped(activity: Activity) {}
            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            override fun onActivityDestroyed(activity: Activity) {}
        })
    }

    companion object {
        @Volatile
        private var instance: Trusanity? = null

        fun init(context: Context, projectId: String, apiHost: String = "https://api.trusanityanalytics.com"): Trusanity {
            return instance ?: synchronized(this) {
                instance ?: Trusanity(context.applicationContext, projectId, apiHost).also { instance = it }
            }
        }

        fun getInstance(): Trusanity {
            return instance ?: throw IllegalStateException("Trusanity Analytics must be initialized via init() before calling getInstance()")
        }
    }
}
