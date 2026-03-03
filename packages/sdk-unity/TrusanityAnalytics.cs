using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;

[System.Serializable]
public class TrusanityEvent
{
    public string name;
    public string timestamp;
    public string session_id;
    public string anonymous_id;
    public string user_id;
    public string url;        // Mapped to Scene Name in Unity
    public string path;       // Mapped to Game State/Level
    public string referrer;   // Mapped to Platform OS
    public Dictionary<string, object> properties;
}

[System.Serializable]
public class TrusanityPayload
{
    public string projectId;
    public List<TrusanityEvent> events;
}

/// <summary>
/// Trusanity Analytics SDK for Unity Engine.
/// Attach this MonoBehaviour to a persistent GameObject (e.g., GameManager configured with DontDestroyOnLoad).
/// </summary>
public class TrusanityAnalytics : MonoBehaviour
{
    public static TrusanityAnalytics Instance { get; private set; }

    [Header("Configuration")]
    [Tooltip("Your Trusanity Analytics Project ID (UUID)")]
    public string projectId;
    
    [Tooltip("The API Host to ingest events to (e.g., https://api.trusanityanalytics.com)")]
    public string apiHost = "https://api.trusanityanalytics.com";
    
    [Tooltip("Enable automatic scene tracking")]
    public bool autoTrackScenes = true;

    [Tooltip("Max events to queue before flushing")]
    public int batchSize = 10;
    
    [Tooltip("Interval to flush events (seconds)")]
    public float flushInterval = 5f;

    // State 
    private string anonymousId;
    private string sessionId;
    private string userId = "";
    private List<TrusanityEvent> eventQueue = new List<TrusanityEvent>();
    private float flushTimer = 0f;
    private bool isFlushing = false;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(this.gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(this.gameObject);

        InitializeIdentity();

        if (autoTrackScenes)
        {
            UnityEngine.SceneManagement.SceneManager.sceneLoaded += OnSceneLoaded;
        }
    }

    private void Start()
    {
        if (string.IsNullOrEmpty(projectId))
        {
            Debug.LogError("[TrusanityAnalytics] Project ID is missing! Analytics will not be captured.");
            return;
        }

        Track("$game_start", new Dictionary<string, object>
        {
            {"resolution", Screen.currentResolution.ToString()},
            {"system_memory", SystemInfo.systemMemorySize},
            {"graphics_device", SystemInfo.graphicsDeviceName}
        });
    }

    private void Update()
    {
        flushTimer += Time.deltaTime;
        if (flushTimer >= flushInterval)
        {
            flushTimer = 0f;
            if (eventQueue.Count > 0)
            {
                Flush();
            }
        }
    }

    private void InitializeIdentity()
    {
        // Anonymous ID (persistent across restarts)
        if (PlayerPrefs.HasKey("trusanity_anon_id"))
        {
            anonymousId = PlayerPrefs.GetString("trusanity_anon_id");
        }
        else
        {
            anonymousId = "unity_" + Guid.NewGuid().ToString();
            PlayerPrefs.SetString("trusanity_anon_id", anonymousId);
            PlayerPrefs.Save();
        }

        // Session ID (unique per app launch)
        sessionId = "sess_" + Guid.NewGuid().ToString();

        // User ID (if previously identified)
        if (PlayerPrefs.HasKey("trusanity_user_id"))
        {
            userId = PlayerPrefs.GetString("trusanity_user_id");
        }
    }

    /// <summary>
    /// Identify a known user (e.g. after login).
    /// </summary>
    public void Identify(string newUserId, Dictionary<string, object> traits = null)
    {
        userId = newUserId;
        PlayerPrefs.SetString("trusanity_user_id", userId);
        PlayerPrefs.Save();

        Track("$identify", traits);
    }

    /// <summary>
    /// Track a custom event.
    /// </summary>
    public void Track(string eventName, Dictionary<string, object> properties = null)
    {
        if (string.IsNullOrEmpty(projectId)) return;

        var evt = new TrusanityEvent
        {
            name = eventName,
            timestamp = DateTime.UtcNow.ToString("o"),
            session_id = sessionId,
            anonymous_id = anonymousId,
            user_id = userId,
            url = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name,
            path = "game_active",
            referrer = SystemInfo.operatingSystem,
            properties = properties ?? new Dictionary<string, object>()
        };

        eventQueue.Add(evt);

        if (eventQueue.Count >= batchSize)
        {
            Flush();
        }
    }

    public void Flush()
    {
        if (isFlushing || eventQueue.Count == 0) return;
        StartCoroutine(FlushCoroutine());
    }

    private IEnumerator FlushCoroutine()
    {
        isFlushing = true;

        List<TrusanityEvent> batch = new List<TrusanityEvent>(eventQueue);
        eventQueue.Clear();

        TrusanityPayload payload = new TrusanityPayload
        {
            projectId = this.projectId,
            events = batch
        };

        string jsonPayload = SerializePayload(payload);
        
        using (UnityWebRequest request = new UnityWebRequest($"{apiHost}/v1/ingest", "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonPayload);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning($"[TrusanityAnalytics] Ingestion failed: {request.error}. Re-queuing events.");
                // Prepend failed batch back to queue
                eventQueue.InsertRange(0, batch);
            }
        }

        isFlushing = false;
    }

    private void OnSceneLoaded(UnityEngine.SceneManagement.Scene scene, UnityEngine.SceneManagement.LoadSceneMode mode)
    {
        Track("$scene_loaded", new Dictionary<string, object> { { "scene_name", scene.name } });
    }

    private void OnApplicationQuit()
    {
        // Attempt synchronous flush best-effort
        if (eventQueue.Count > 0)
        {
            Flush();
        }
    }

    // A simple JSON serializer. In production, use Newtonsoft.Json for complex Dictionaries.
    // Unity's JsonUtility does not support Dictionaries natively without wrappers.
    // For MVP, building a crude custom JSON builder or enforcing structured logging is required.
    private string SerializePayload(TrusanityPayload payload)
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.Append($"\"projectId\":\"{payload.projectId}\",");
        sb.Append("\"events\":[");
        
        for (int i = 0; i < payload.events.Count; i++)
        {
            var e = payload.events[i];
            sb.Append("{");
            sb.Append($"\"name\":\"{e.name}\",");
            sb.Append($"\"timestamp\":\"{e.timestamp}\",");
            sb.Append($"\"session_id\":\"{e.session_id}\",");
            sb.Append($"\"anonymous_id\":\"{e.anonymous_id}\",");
            sb.Append($"\"user_id\":\"{e.user_id}\",");
            sb.Append($"\"url\":\"{e.url}\",");
            sb.Append($"\"path\":\"{e.path}\",");
            sb.Append($"\"referrer\":\"{e.referrer}\",");
            
            // Empty properties block for MVP lack of Dictionary support in built-in JSONUtility
            sb.Append("\"properties\":{}"); 
            
            sb.Append("}");
            if (i < payload.events.Count - 1) sb.Append(",");
        }
        
        sb.Append("]");
        sb.Append("}");
        return sb.ToString();
    }
}
