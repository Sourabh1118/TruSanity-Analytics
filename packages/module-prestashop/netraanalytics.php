<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

class TrusanityAnalytics extends Module
{
    public function __construct()
    {
        $this->name = 'trusanityanalytics';
        $this->tab = 'analytics_stats';
        $this->version = '1.0.0';
        $this->author = 'Trusanity Open Source Team';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '1.7.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->trans('Trusanity Analytics', [], 'Modules.Trusanityanalytics.Admin');
        $this->description = $this->trans('Privacy-first behavioral analytics tracking. Connects your PrestaShop store to your Trusanity Analytics workspace.', [], 'Modules.Trusanityanalytics.Admin');
        $this->confirmUninstall = $this->trans('Are you sure you want to uninstall Trusanity Analytics?', [], 'Modules.Trusanityanalytics.Admin');
    }

    public function install()
    {
        if (Shop::isFeatureActive()) {
            Shop::setContext(Shop::CONTEXT_ALL);
        }

        return parent::install() &&
            $this->registerHook('displayHeader') &&
            $this->registerHook('actionValidateOrder') &&
            Configuration::updateValue('TRUSANITY_API_KEY', '') &&
            Configuration::updateValue('TRUSANITY_INGEST_URL', 'https://api.trusanity.com');
    }

    public function uninstall()
    {
        if (
            !parent::uninstall() ||
            !Configuration::deleteByName('TRUSANITY_API_KEY') ||
            !Configuration::deleteByName('TRUSANITY_INGEST_URL')
        ) {
            return false;
        }

        return true;
    }

    public function getContent()
    {
        $output = '';

        if (Tools::isSubmit('submitTrusanityAnalyticsConf')) {
            $apiKey = (string) Tools::getValue('TRUSANITY_API_KEY');
            $apiUrl = (string) Tools::getValue('TRUSANITY_INGEST_URL', 'https://api.trusanity.com');

            Configuration::updateValue('TRUSANITY_API_KEY', $apiKey);
            Configuration::updateValue('TRUSANITY_INGEST_URL', $apiUrl);

            $output .= $this->displayConfirmation($this->trans('Settings updated', [], 'Admin.Global'));
        }

        return $output . $this->displayForm();
    }

    public function displayForm()
    {
        $form = [
            'form' => [
                'legend' => [
                    'title' => $this->trans('Settings', [], 'Admin.Global'),
                    'icon' => 'icon-cogs',
                ],
                'input' => [
                    [
                        'type' => 'text',
                        'label' => $this->trans('Project API Key', [], 'Modules.Trusanityanalytics.Admin'),
                        'name' => 'TRUSANITY_API_KEY',
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->trans('Ingest URL (Self-Hosted Config Only)', [], 'Modules.Trusanityanalytics.Admin'),
                        'name' => 'TRUSANITY_INGEST_URL',
                        'desc' => $this->trans('Leave as https://api.trusanity.com unless you are self-hosting.', [], 'Modules.Trusanityanalytics.Admin'),
                    ],
                ],
                'submit' => [
                    'title' => $this->trans('Save', [], 'Admin.Actions'),
                ],
            ],
        ];

        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $helper->module = $this;
        $helper->default_form_language = $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);

        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submitTrusanityAnalyticsConf';
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false)
            . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');

        $helper->tpl_vars = [
            'fields_value' => $this->getConfigFormValues(),
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id,
        ];

        return $helper->generateForm([$form]);
    }

    protected function getConfigFormValues()
    {
        return [
            'TRUSANITY_API_KEY' => Configuration::get('TRUSANITY_API_KEY', ''),
            'TRUSANITY_INGEST_URL' => Configuration::get('TRUSANITY_INGEST_URL', 'https://api.trusanity.com'),
        ];
    }

    public function hookDisplayHeader()
    {
        $apiKey = Configuration::get('TRUSANITY_API_KEY');
        $apiUrl = Configuration::get('TRUSANITY_INGEST_URL');

        if (empty($apiKey)) {
            return '';
        }

        // Avoid tracking back office admins if logged in as customer
        if (isset($this->context->employee) && $this->context->employee->isLoggedBack()) {
            return '';
        }

        $html = '<script>
        (function(n,e,t,r,a){
            n.Trusanity=n.Trusanity||function(){(n.Trusanity.q=n.Trusanity.q||[]).push(arguments)};
            var s=e.createElement(t);s.async=1;s.src=r;
            var c=e.getElementsByTagName(t)[0];c.parentNode.insertBefore(s,c);
        })(window,document,\'script\',\'' . Tools::safeOutput($apiUrl) . '/js/sdk.js\');
        
        Trusanity(\'init\', \'' . Tools::safeOutput($apiKey) . '\', { apiHost: \'' . Tools::safeOutput($apiUrl) . '\' });
        ';

        if ($this->context->customer->isLogged()) {
            $hashedId = hash('sha256', $this->context->customer->email);
            $html .= 'Trusanity(\'identify\', \'' . Tools::safeOutput($hashedId) . '\');';
        }

        $html .= '</script>';

        return $html;
    }

    public function hookActionValidateOrder($params)
    {
        $apiKey = Configuration::get('TRUSANITY_API_KEY');
        $apiUrl = Configuration::get('TRUSANITY_INGEST_URL');

        if (empty($apiKey)) {
            return;
        }

        /** @var Order $order */
        $order = $params['order'];

        /** @var Customer $customer */
        $customer = $params['customer'];

        /** @var Cart $cart */
        $cart = $params['cart'];

        if (!Validate::isLoadedObject($order)) {
            return;
        }

        $items = [];
        $products = $order->getProducts();

        foreach ($products as $product) {
            $items[] = [
                'sku' => $product['product_reference'],
                'name' => $product['product_name'],
                'price' => (float) $product['product_price_wt'],
                'quantity' => (int) $product['product_quantity']
            ];
        }

        $hashedEmail = hash('sha256', $customer->email ?? '');
        $currency = new Currency($order->id_currency);

        $payload = [
            'projectId' => $apiKey,
            'events' => [
                [
                    'name' => 'Purchase_Completed',
                    'session_id' => 'prestashop_server_side',
                    'anonymous_id' => $hashedEmail,
                    'timestamp' => date('Y-m-d\TH:i:s\Z'),
                    'properties' => [
                        'platform' => 'prestashop',
                        'order_id' => $order->id,
                        'order_reference' => $order->reference,
                        'revenue' => (float) $order->total_paid_tax_incl,
                        'shipping_amount' => (float) $order->total_shipping_tax_incl,
                        'tax_amount' => (float) ($order->total_paid_tax_incl - $order->total_paid_tax_excl),
                        'currency' => $currency->iso_code,
                        'items' => $items
                    ]
                ]
            ]
        ];

        // Perform async curl request
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, rtrim($apiUrl, '/') . '/v1/ingest');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3); // Short timeout to not block order processing

        // Execute and immediately close without waiting for response payload processing 
        curl_exec($ch);
        curl_close($ch);
    }
}
