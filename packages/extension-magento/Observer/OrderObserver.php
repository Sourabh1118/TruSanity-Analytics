<?php
namespace Trusanity\Analytics\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Psr\Log\LoggerInterface;

class OrderObserver implements ObserverInterface
{
    protected $curl;
    protected $scopeConfig;
    protected $logger;

    public function __construct(
        Curl $curl,
        ScopeConfigInterface $scopeConfig,
        LoggerInterface $logger
    ) {
        $this->curl = $curl;
        $this->scopeConfig = $scopeConfig;
        $this->logger = $logger;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // Get Trusanity configuration
        $apiKey = $this->scopeConfig->getValue('trusanity/general/api_key', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        $apiUrl = $this->scopeConfig->getValue('trusanity/general/api_url', \Magento\Store\Model\ScopeInterface::SCOPE_STORE) ?: 'https://api.trusanity.com/v1/ingest';

        if (empty($apiKey)) {
            return;
        }

        try {
            /** @var \Magento\Sales\Model\Order $order */
            $order = $observer->getEvent()->getOrder();
            $quote = $observer->getEvent()->getQuote();

            if (!$order) {
                return;
            }

            // Extract items
            $items = [];
            foreach ($order->getAllVisibleItems() as $item) {
                $items[] = [
                    'sku' => $item->getSku(),
                    'name' => $item->getName(),
                    'price' => (float) $item->getPrice(),
                    'quantity' => (int) $item->getQtyOrdered(),
                ];
            }

            // Hash email for privacy
            $hashedEmail = hash('sha256', $order->getCustomerEmail() ?? '');

            $payload = [
                'projectId' => $apiKey,
                'events' => [
                    [
                        'name' => 'Purchase_Completed',
                        'session_id' => 'magento_server_side',
                        'anonymous_id' => $hashedEmail,
                        'timestamp' => date('Y-m-d\TH:i:s\Z'),
                        'properties' => [
                            'platform' => 'magento',
                            'order_id' => $order->getIncrementId(),
                            'revenue' => (float) $order->getGrandTotal(),
                            'currency' => $order->getOrderCurrencyCode(),
                            'coupon_code' => $order->getCouponCode(),
                            'shipping_amount' => (float) $order->getShippingAmount(),
                            'tax_amount' => (float) $order->getTaxAmount(),
                            'store_id' => $order->getStoreId(),
                            'items' => $items
                        ]
                    ]
                ]
            ];

            // Send to Trusanity Ingestion API asynchronously
            $this->curl->setHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer {$apiKey}"
            ]);
            $this->curl->post($apiUrl, json_encode($payload));

            // Log response if necessary for debug
            $status = $this->curl->getStatus();
            if ($status !== 200 && $status !== 202) {
                $this->logger->warning('Trusanity Analytics Event Ingestion Failed', ['status' => $status, 'response' => $this->curl->getBody()]);
            }

        } catch (\Exception $e) {
            $this->logger->error('Trusanity Analytics Server-side tracking error: ' . $e->getMessage());
        }
    }
}
