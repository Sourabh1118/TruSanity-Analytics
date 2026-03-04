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
});
