'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModel from './MeetingModel'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/hooks/use-toast"
import { Textarea } from './ui/textarea'
import ReactDatePicker from 'react-datepicker'
import { Input } from "@/components/ui/input"


const MeetingTypeList = () => {
  const { toast } = useToast()
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduledMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })
  const [callDetails, setCallDetails] = useState<Call>()

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({
          title: "Please select a date and time"
        })
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id)
      if (!call) throw new Error('Failed to create call');

      const startAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at: startAt,
          custom: {
            description
          }
        }
      })

      setCallDetails(call);

      if (!values.description) {
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
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

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
          isOpen={meetingState === 'isScheduledMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create An Instant Meeting"
          handleClick={() => createMeeting()}
        >
          <div className='flex flex-col gap-2.5'>
            <label className='text-base text-normal leading-[22px] text-sky-200 '>
              Add a description
              <Textarea className='focus-visible:ring-0 focus-visible-ring-offset-0 border-none bg-dark-2'
                onChange={((e) => { setValues({ ...values, description: e.target.value }) })}
              />
            </label>
          </div>
          <div className='flex w-full flex-col gap-2'>
            <label className='text-base text-normal leading-[22px] text-sky-200 '>
              Select date and time
              <ReactDatePicker selected={values.dateTime} 
              onChange={(date)=>{
                setValues({...values,dateTime:date!})
              }} 
              selectsEnd
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={15}
              timeCaption='time'
              dateFormat={"MMMM d, yyyy h:mm aa"}
              className='w-full rounded bg-dark-2 p-2 focus:outline-none'
              />
            </label>
          </div>
        </MeetingModel>
      ) : (
        <MeetingModel
          isOpen={meetingState === 'isScheduledMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
          buttonText="Copy Meeting Link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink)
            toast({title:"Meeting link copied successfully"})
          }}
          image='/icons/checked.svg'
          buttonIcon='/icons/copy.svg'
        />
      )}
      <MeetingModel
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start An Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={() => createMeeting()}
      />

        <MeetingModel
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input className='border-none bg-dark-2 focus-visible:ring-0 focus-visible:ring-offset-0' placeholder='Meeting link' onChange={(e)=>{setValues({...values,link:e.target.value})}}/>
      </MeetingModel>
    </section>
  )
}

export default MeetingTypeList