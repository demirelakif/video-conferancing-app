'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModel from './MeetingModel'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/hooks/use-toast"


const MeetingTypeList = () => {
  const { toast } = useToast()
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduledMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined> ();
  const {user} = useUser();
  const client = useStreamVideoClient();
  const [values,setValues] = useState({
    dateTime : new Date(),
    description : '',
    link:''
  })
  const [callDetails, setcallDetails] = useState<Call>()
  
  const createMeeting = async() => {
    if(!client || !user) return;
    try {
      if(!values.dateTime){
        toast({
          title: "Please select a date and time"
        })
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default',id)
      if(!call) throw new Error('Failed to create call');
      
      const startAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data:{
          starts_at:startAt,
          custom:{
            description
          }
        }
      })

      setcallDetails(call);

      if(!values.description){
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: "Meeting Created"
      })
    } catch (error) {
        console.log(error);
        toast({
          title: "Failed to create meeting"
        })
    }
  }
  
  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard 
      img='/icons/add-meeting.svg'
      title='New Meeting'
      description='Start an instant meeting'
      className='bg-orange-1'
      handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard 
      img='/icons/schedule.svg'
      title='Schedule Meeting'
      description='Plan meeting'
      className='bg-blue-1'
      handleClick={() => setMeetingState('isScheduledMeeting')}
      />
      <HomeCard 
      img='/icons/recordings.svg'
      title='View Recordings'
      description='Check out your recordings'
      className='bg-purple-1'
      handleClick={() => router.push('/recordings')}
      />
      <HomeCard 
      img='/icons/join-meeting.svg'
      title='Join Meeting'
      description='via invitation link'
      className='bg-yellow-1'
      handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      {!callDetails ? (
        <MeetingModel 
        isOpen = {meetingState === 'isScheduledMeeting'}
        onClose = {() => setMeetingState(undefined)}
        title = "Create An Instant Meeting"
        handleClick = {() => createMeeting()}
      />
      ) : (
        <MeetingModel 
        isOpen = {meetingState === 'isScheduledMeeting'}
        onClose = {() => setMeetingState(undefined)}
        title = "Meeting Created"
        className = "text-center"
        buttonText = "Copy Meeting Link"
        handleClick = {() => 
        {
          // navigator.clipboard.write(meetingLink)
        }}
        image='/icons/checked.svg'
        buttonIcon='/icons/copy.svg'
      />
      )}
      <MeetingModel 
        isOpen = {meetingState === 'isInstantMeeting'}
        onClose = {() => setMeetingState(undefined)}
        title = "Start An Instant Meeting"
        className = "text-center"
        buttonText = "Start Meeting"
        handleClick = {() => createMeeting()}
      />
    </section>
  )
}

export default MeetingTypeList