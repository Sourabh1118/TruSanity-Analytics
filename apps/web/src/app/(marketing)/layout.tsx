/**
 * Marketing layout — wraps public-facing pages (landing, pricing, docs, etc.)
 *
 * This layout intentionally has NO session requirement and NO dashboard sidebar.
 * It's kept minimal so the Storefront can later replace this with its own
 * fully-featured layout when marketing pages move to TruSanity_Storefront.
 */
export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
