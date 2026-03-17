/* Trusanity Analytics — Admin JS */
jQuery(function ($) {
    var $btn = $('#trus-verify-btn');
    var $result = $('#trus-verify-result');

    $btn.on('click', function () {
        var key = $('#trus-api-key').val().trim();
        var ingest = $('input[name="trusanity_ingest_url"]').val().trim();

        if (!key) {
            $result.removeClass('ok').addClass('err').text('⚠ Please enter an API key first.');
            return;
        }

        $btn.prop('disabled', true).text('Testing…');
        $result.removeClass('ok err').text('');

        $.post(TrusAdmin.ajax_url, {
            action: 'trus_verify_key',
            nonce: TrusAdmin.nonce,
            api_key: key,
            ingest_url: ingest || 'https://api.trusanity.com',
        }, function (res) {
            if (res.success) {
                $result.addClass('ok').text('✓ ' + res.data.message);
            } else {
                $result.addClass('err').text('✗ ' + (res.data ? res.data.message : 'Verification failed.'));
            }
        }).fail(function () {
            $result.addClass('err').text('✗ Network error — could not reach the server.');
        }).always(function () {
            $btn.prop('disabled', false).text('Test Connection');
        });
    });

    // --- Test Event & Debug Log ---
    var $testBtn = $('#trus-test-event-btn');
    var $log = $('#trus-debug-log');

    function logToUI(msg, type) {
        var now = new Date().toTimeString().split(' ')[0];
        var cssClass = '';
        if (type === 'err') cssClass = 'log-err';
        else if (type === 'tx') cssClass = 'log-tx';
        else if (type === 'rx') cssClass = 'log-rx';

        var line = '<span class="log-time">[' + now + ']</span> <span class="' + cssClass + '">' + msg + '</span>\n';
        if ($log.text() === 'Waiting for actions...') $log.html('');
        $log.append(line);
        $log.scrollTop($log[0].scrollHeight);
    }

    $testBtn.on('click', function () {
        var key = $('#trus-api-key').val().trim();
        var ingest = $('input[name="trusanity_ingest_url"]').val().trim();
        ingest = ingest || 'https://api.trusanity.com';

        if (!key) {
            logToUI('ERROR: Cannot send test event, API Key is missing.', 'err');
            return;
        }

        var payload = {
            projectId: key,
            events: [{
                name: 'Test_Connection_Event',
                session_id: 'test_session_123',
                anonymous_id: 'test_anon_456',
                timestamp: new Date().toISOString(),
                properties: { test: true, source: 'wp-admin-dashboard' }
            }]
        };

        var jsonPayload = JSON.stringify(payload);
        logToUI('POST ' + ingest + '/v1/ingest', 'tx');
        logToUI('Payload: ' + jsonPayload, 'tx');

        $testBtn.prop('disabled', true).text('Sending...');

        $.ajax({
            url: ingest + '/v1/ingest',
            type: 'POST',
            data: jsonPayload,
            // Use text/plain to avoid CORS preflight if the backend doesn't strictly require application/json, 
            // though keeping application/json usually requires the server to correctly respond to OPTIONS.
            contentType: 'application/json', 
            headers: { 
                // Some adblockers block requests outright if they see typical tracking headers or destinations.
                'Authorization': 'Bearer ' + key
            },
            // Prevent caching
            cache: false,
            // Let the browser send credentials if needed, though usually not for Bearer tokens
            xhrFields: {
                withCredentials: false 
            },
            success: function (data, textStatus, jqXHR) {
                logToUI('HTTP ' + jqXHR.status + ' ' + jqXHR.statusText, 'rx');
                logToUI('Response: ' + JSON.stringify(data), 'rx');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                logToUI('HTTP ' + jqXHR.status + ' (' + errorThrown + ')', 'err');
                if (jqXHR.responseText) {
                    logToUI('Response Text: ' + jqXHR.responseText, 'err');
                } else if (jqXHR.status === 0) {
                    logToUI('Response: HTTP 0 - Network Error. This usually means:', 'err');
                    logToUI('1. The URL (' + ingest + ') is unreachable or down.', 'err');
                    logToUI('2. Your browser or an adblocker (uBlock, Brave Shields) blocked the request.', 'err');
                    logToUI('3. The server failed the CORS preflight check.', 'err');
                } else {
                    logToUI('Response: Unknown Error', 'err');
                }
            },
            complete: function () {
                $testBtn.prop('disabled', false).text('Send Test Event');
            }
        });
    });
});

