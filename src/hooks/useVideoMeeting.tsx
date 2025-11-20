import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMeetingParams {
  platform: 'zoom' | 'google_meet' | 'teams';
  title: string;
  startTime: Date;
  duration: number;
  participants: string[];
  assignmentId?: string;
}

export const useVideoMeeting = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createMeeting = async (params: CreateMeetingParams) => {
    try {
      setLoading(true);

      // TODO: Call edge function to create meeting
      // const { data, error } = await supabase.functions.invoke(
      //   `integration-${params.platform}`,
      //   {
      //     body: {
      //       action: 'create_meeting',
      //       ...params
      //     }
      //   }
      // );

      // For demo purposes, create a mock meeting URL
      const mockMeetingUrl = `https://${params.platform}.example.com/j/${Math.random().toString(36).substr(2, 9)}`;
      
      // If assignmentId provided, update the roster assignment
      if (params.assignmentId) {
        const { error } = await supabase
          .from('roster_assignment')
          .update({
            meeting_url: mockMeetingUrl,
            meeting_platform: params.platform,
            meeting_id: Math.random().toString(36).substr(2, 9)
          })
          .eq('id', params.assignmentId);

        if (error) throw error;
      }

      toast({
        title: "Meeting created",
        description: `Your ${params.platform} meeting has been scheduled.`,
      });

      return {
        meeting_url: mockMeetingUrl,
        meeting_id: Math.random().toString(36).substr(2, 9),
        platform: params.platform
      };
    } catch (error: any) {
      toast({
        title: "Failed to create meeting",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startInstantMeeting = async (platform: string) => {
    try {
      setLoading(true);

      // TODO: Call edge function for instant meeting
      // const { data } = await supabase.functions.invoke(
      //   `integration-${platform}`,
      //   {
      //     body: {
      //       action: 'create_instant_meeting',
      //       duration: 60
      //     }
      //   }
      // );

      const mockJoinUrl = `https://${platform}.example.com/j/instant-${Date.now()}`;

      toast({
        title: "Instant meeting started",
        description: "Opening meeting in new window...",
      });

      window.open(mockJoinUrl, '_blank');

      return mockJoinUrl;
    } catch (error: any) {
      toast({
        title: "Failed to start meeting",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMeetingRecordings = async (meetingId: string) => {
    try {
      const { data, error } = await supabase
        .from('meeting_recordings')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error: any) {
      toast({
        title: "Error loading recordings",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    createMeeting,
    startInstantMeeting,
    getMeetingRecordings,
    loading,
  };
};
