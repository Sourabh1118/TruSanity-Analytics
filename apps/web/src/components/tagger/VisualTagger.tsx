"use client";

import { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label } from '@trusanity/ui';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export default function VisualTagger({ projectId }: { projectId: string }) {
    const [url, setUrl] = useState('');
    const [loadedUrl, setLoadedUrl] = useState('');
    const [isTagging, setIsTagging] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [selectedElement, setSelectedElement] = useState<{ selector: string; textContent: string; tagName: string } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'NETRA_ELEMENT_SELECTED') {
                setSelectedElement(event.data.payload);
                setIsDialogOpen(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleLoadWebsite = () => {
        let finalUrl = url;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        setLoadedUrl(finalUrl);
        setIsTagging(false); // Reset tagging mode when loading new URL
    };

    const toggleTaggingMode = () => {
        const newMode = !isTagging;
        setIsTagging(newMode);

        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: newMode ? 'NETRA_ENTER_TAGGING_MODE' : 'NETRA_EXIT_TAGGING_MODE'
            }, '*');
        }
    };

    const handleSaveRule = async () => {
        if (!selectedElement || !eventName) return;

        // In a real app, this would call a server action or API route to save the tracking_rule
        console.log('Saving Tracking Rule:', {
            projectId,
            eventName,
            cssSelector: selectedElement.selector,
        });

        setIsDialogOpen(false);
        setEventName('');
        setSelectedElement(null);

        // Let the iframe know we saved it
        // iframeRef.current?.contentWindow?.postMessage({ type: 'NETRA_EXIT_TAGGING_MODE' }, '*');
        // setIsTagging(false); 
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Visual Event Tagger</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Enter your website URL (e.g. example.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadWebsite()}
                        />
                        <Button onClick={handleLoadWebsite}>Load Site</Button>
                        <Button
                            className={isTagging ? "bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white" : ""}
                            onClick={toggleTaggingMode}
                            disabled={!loadedUrl}
                        >
                            {isTagging ? 'Stop Tagging' : 'Start Tagging'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loadedUrl ? (
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
                    {isTagging && (
                        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold shadow-md animate-pulse pointer-events-none">
                            Tagging Mode Active — Click any element!
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        src={loadedUrl}
                        className="w-full h-full"
                        title="Website Preview"
                    />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500">Enter a URL above to load your website and start tagging events.</p>
                </div>
            )}

            <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 pointer-events-auto" />
                    <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg">
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">Create Tracking Rule</DialogPrimitive.Title>
                        </div>
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-gray-100 rounded-md text-sm">
                                <span className="font-semibold block mb-1">Target Element:</span>
                                <span className="font-mono text-xs text-blue-600 break-all">{selectedElement?.selector}</span>
                                {selectedElement?.textContent && (
                                    <p className="mt-2 text-gray-600 italic">"{selectedElement.textContent}"</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventName">Event Name</Label>
                                <Input
                                    id="eventName"
                                    placeholder="e.g. Signed_Up_Button_Click"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                            <Button className="bg-gray-200 text-black hover:bg-gray-300" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveRule} disabled={!eventName}>Save Rule</Button>
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </div>
    );
}
