"use client";

import { useState } from 'react';
import { Button, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@trusanity/ui';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { createReportSchedule, deleteReportSchedule } from '@/actions/reports';
import { Plus, Trash, Clock, FileText } from 'lucide-react';

interface ReportSchedule {
    id: string;
    name: string;
    emails: string;
    scheduleConfig: string;
    isActive: boolean;
    lastSentAt: Date | null;
}

export default function ReportManagerClient({ projectId, initialSchedules }: { projectId: string; initialSchedules: ReportSchedule[] }) {
    const [schedules, setSchedules] = useState<ReportSchedule[]>(initialSchedules);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New schedule state
    const [newName, setNewName] = useState('');
    const [newEmails, setNewEmails] = useState('');
    const [newConfig, setNewConfig] = useState('weekly');

    const handleCreate = async () => {
        try {
            await createReportSchedule(projectId, newName.trim(), newEmails.trim(), newConfig);
            window.location.reload();
        } catch (e) {
            alert('Failed to create report schedule.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteReportSchedule(id, projectId);
            setSchedules(schedules.filter(s => s.id !== id));
        } catch (e) {
            console.error("Delete Failed");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-lg border border-dashed">
                <div className="text-sm text-gray-500">
                    Reports run periodically according to schedule config, generating a summary sent via email.
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Schedule
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Schedule Interval</TableHead>
                            <TableHead>Recipients</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No active report schedules configured.
                                </TableCell>
                            </TableRow>
                        ) : schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        {schedule.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1 capitalize">
                                        <Clock className="w-4 h-4" />
                                        {schedule.scheduleConfig}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm truncate max-w-xs">{schedule.emails}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={schedule.isActive ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-800'}>
                                        {schedule.isActive ? 'Active' : 'Paused'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDelete(schedule.id)}>
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" />
                    <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border p-6">
                        <DialogPrimitive.Title className="text-xl font-bold mb-4 tracking-tight">Configure Report Schedule</DialogPrimitive.Title>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-500">Report Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Weekly Executive Summary"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emails" className="text-xs font-semibold uppercase text-gray-500">Recipients (Comma separated)</Label>
                                <Input
                                    id="emails"
                                    placeholder="e.g. team@example.com, ceo@example.com"
                                    value={newEmails}
                                    onChange={(e) => setNewEmails(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-gray-500">Schedule Frequency</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={newConfig}
                                    onChange={(e) => setNewConfig(e.target.value)}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-8 pt-4 border-t">
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={!newName || newName.length < 3 || !newEmails}>
                                Create Schedule
                            </Button>
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </div>
    );
}
