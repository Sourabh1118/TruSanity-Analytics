"use client";

import { useState } from 'react';
import { Button, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@trusanity/ui';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { createAlert, deleteAlert } from '@/actions/alerts';
import { Plus, Trash, BellRing, ActivitySquare } from 'lucide-react';

interface Alert {
    id: string;
    name: string;
    metricName: string;
    operator: string;
    threshold: number;
    windowMinutes: number;
    isActive: boolean;
}

export default function AlertsManagerClient({ projectId, initialAlerts }: { projectId: string; initialAlerts: Alert[] }) {
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New alert state
    const [newName, setNewName] = useState('');
    const [newMetric, setNewMetric] = useState('pageview');
    const [newOp, setNewOp] = useState('>');
    const [newThreshold, setNewThreshold] = useState(100);
    const [newWindow, setNewWindow] = useState(60);

    const handleCreate = async () => {
        try {
            await createAlert(projectId, newName.trim(), newMetric, newOp, newThreshold, newWindow);
            window.location.reload();
        } catch (e) {
            alert('Failed to create alert monitor.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAlert(id, projectId);
            setAlerts(alerts.filter(a => a.id !== id));
        } catch (e) {
            console.error("Delete Failed");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-lg border border-dashed">
                <div className="text-sm text-gray-500">
                    Alerts continuously monitor incoming Kafka streams in ClickHouse and trigger Webhooks or Emails when thresholds are breached.
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Alert
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Monitor Name</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Time Window</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alerts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No active anomaly monitors configured.
                                </TableCell>
                            </TableRow>
                        ) : alerts.map((alert) => (
                            <TableRow key={alert.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <BellRing className="w-4 h-4 text-blue-500" />
                                        {alert.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-pink-600 font-bold border border-pink-200">
                                        COUNT({alert.metricName}) {alert.operator} {alert.threshold}
                                    </code>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <ActivitySquare className="w-4 h-4" />
                                        Last {alert.windowMinutes} mins
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={alert.isActive ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-800'}>
                                        {alert.isActive ? 'Monitoring' : 'Paused'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDelete(alert.id)}>
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Creation Dialog Primitive Wrapper */}
            <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" />
                    <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border p-6">
                        <DialogPrimitive.Title className="text-xl font-bold mb-4 tracking-tight">Configure Anomaly Alert</DialogPrimitive.Title>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-500">Monitor Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Unusually High Bounce Rate"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50/50">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase text-gray-500">Event Metric</Label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newMetric}
                                        onChange={(e) => setNewMetric(e.target.value)}
                                    >
                                        <option value="pageview">Pageviews</option>
                                        <option value="signup">Signups</option>
                                        <option value="purchase">Purchases</option>
                                        <option value="error">Errors</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase text-gray-500">Operator</Label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={newOp}
                                        onChange={(e) => setNewOp(e.target.value)}
                                    >
                                        <option value=">">Greater Than (&gt;)</option>
                                        <option value="<">Less Than (&lt;)</option>
                                        <option value="=">Exactly Equals (=)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="threshold" className="text-xs font-semibold uppercase text-gray-500">Threshold</Label>
                                    <Input
                                        id="threshold"
                                        type="number"
                                        value={newThreshold}
                                        onChange={(e) => setNewThreshold(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="window" className="text-xs font-semibold uppercase text-gray-500">Rolling Time Window (Minutes)</Label>
                                    <span className="text-xs font-mono font-medium bg-gray-100 px-2 py-1 rounded">Last {newWindow}m</span>
                                </div>
                                <input
                                    type="range"
                                    id="window"
                                    min="5" max="1440" step="5"
                                    className="w-full accent-blue-600"
                                    value={newWindow}
                                    onChange={(e) => setNewWindow(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-8 pt-4 border-t">
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={!newName || newName.length < 3}>
                                Create Monitor
                            </Button>
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </div>
    );
}
