import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideoMeeting } from '@/hooks/useVideoMeeting';
import { Video, Loader2 } from 'lucide-react';
import { FlightSession } from '@/data/schedule';

interface MeetingSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: FlightSession;
  onMeetingCreated?: (meetingUrl: string, platform: string) => void;
}

export function MeetingScheduler({ open, onOpenChange, flight, onMeetingCreated }: MeetingSchedulerProps) {
  const [platform, setPlatform] = useState<'zoom' | 'google_meet' | 'teams'>('zoom');
  const { createMeeting, loading } = useVideoMeeting();

  const handleSchedule = async () => {
    // Parse duration from time range (e.g., "09:00-10:30" = 90 minutes)
    const timeParts = flight.time.split('-');
    let duration = 60; // default 60 minutes
    if (timeParts.length === 2) {
      const [startStr, endStr] = timeParts;
      const [startHour, startMin] = startStr.trim().split(':').map(Number);
      const [endHour, endMin] = endStr.trim().split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      duration = endMinutes - startMinutes;
    }

    const result = await createMeeting({
      platform,
      title: `Flight Training: ${flight.student} - ${flight.type}`,
      startTime: new Date(`${new Date().toDateString()} ${flight.timeStart}`),
      duration,
      participants: [flight.student, flight.instructor],
      assignmentId: flight.id
    });

    if (result) {
      onMeetingCreated?.(result.meeting_url, result.platform);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Schedule Video Meeting
          </DialogTitle>
          <DialogDescription>
            Create a video conference for this training session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-medium">Session Details</Label>
            <div className="text-sm space-y-1 bg-muted p-3 rounded-lg">
              <div><span className="text-muted-foreground">Student:</span> {flight.student}</div>
              <div><span className="text-muted-foreground">Instructor:</span> {flight.instructor}</div>
              <div><span className="text-muted-foreground">Time:</span> {flight.time}</div>
              <div><span className="text-muted-foreground">Type:</span> {flight.type}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Video Platform</Label>
            <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Zoom
                  </div>
                </SelectItem>
                <SelectItem value="google_meet">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Google Meet
                  </div>
                </SelectItem>
                <SelectItem value="teams">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Microsoft Teams
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
