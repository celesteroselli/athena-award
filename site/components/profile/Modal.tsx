import Icon from '@hackclub/icons'
import { Dialog, Tab, Transition } from '@headlessui/react'
import { Fragment, useState, useContext, FormEvent, useEffect } from 'react'
import { signIn, useSession } from "next-auth/react";
import { Tooltip } from 'react-tooltip';
import Image from 'next/image';
import { ProfileIsOpenContext } from '../island/Modal';
import { Session } from 'next-auth';
import { Warning } from '@/components/panels/add-ons/Callout';

export default function Profile(){
    const { profileIsOpen, setProfileIsOpen } = useContext(ProfileIsOpenContext)
    const [ hackathonName, setHackathonName ] = useState("")
    const [ error, setError ] = useState("")
    const session = useSession();
    function clear(){
      setProfileIsOpen(false)
      setError("")
    }

    async function submitCode(event: FormEvent<HTMLFormElement>){
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const fo = JSON.parse(JSON.stringify(Object.fromEntries(formData)))
      if (fo.code){
        const response = await fetch(`/api/hackathon/${fo.code}`, {
          method: 'POST'
        })
        return response.json()
      }
      return {"error": "Code not provided"}
    }
    async function fetchHackathons(){
      const response = fetch(`/api/hackathon`, {
        method: 'GET'
      }).then(r => r.json()).then(data => setHackathonName(data["message"]))
      return response
    }

    useEffect(() => {
      fetchHackathons()
    }, [])

    return (
        <>
<ProfileIsOpenContext.Provider value={{profileIsOpen: profileIsOpen, setProfileIsOpen: setProfileIsOpen}}>
    <Transition appear show={profileIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => clear()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-[50vh]"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-[50vh]"
              >
                <Dialog.Panel className="w-full h-[80vh] max-w-5xl transform overflow-scroll rounded-xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="flex min-h-full">
                    <Tab.Group vertical>
                      <Tab.List className="h-[80vh] sticky flex flex-col p-6 justify-between items-center rounded-l-xl text-hc-primary bg-hc-secondary w-32">
                        <div className="flex flex-col justify-evenly items-center grow">
                          <div className="-rotate-90 font-bold text-2xl px-7 whitespace-nowrap">PROFILE</div>
                        </div>
                        <button className="p-2 bg-hc-primary/20 rounded-md w-full" onClick={() => clear()}>Close</button>
                      </Tab.List>
                      <Tab.Panels className="w-full min-h-full">
                    <Tab.Panel className="w-full h-full p-10">
                    <h2 className="text-4xl text-hc-primary font-bold">Profile {process.env.AUTH_SECRET}</h2>
                    <div className = "text-xl">
                        {session.status === "authenticated" ? 
                        <div>
                            <div className = "flex md:flex-row flex-col gap-8">
                                <img className = "rounded-full w-4/12 mx-auto md:m-0" src = {`${session.data.user!.image}`}></img>
                                <div>
                                    <h1 className="text-2xl text-hc-primary">Personal Information</h1>
                                <div>
                                    <b>Name:</b>{' '}
                                    {session.data.user!.name}
                                </div> 
                                <div>
                                    <b>Email:</b>{' '}
                                    {session.data.user!.email}
                                </div> 
                                <div>
                                  <b>Hackathon:</b>{' '}
                                    { hackathonName ? hackathonName : "None" }
                                </div>
                                </div>
                                </div>
                            </div>:                          
                            <div>
                                Not signed in.
                            </div> 
                        }
                        <div>
                        <h1 className="text-2xl text-hc-primary">Other</h1>
                            Part of a{' '}
                            <Tooltip id="hackathon" place="top-start" className="z-10"/>
                            <span 
                                data-tooltip-id="hackathon" 
                                data-tooltip-content="Ask your Days of Service hackathon leads for the unique Athena Award code!" 
                                className="font-bold">
                                hackathon?{' '}
                            </span> 
                            Submit the unique code here:{' '}
                            <form className = "flex flex-row gap-5 my-4" onSubmit={ async (event) => { 
                                {
                                  let hackathon = await submitCode(event)
                                  setHackathonName(hackathon.message)
                                  setError(hackathon.error)
                                  } }}>
                              <input type="text" name="code"/>
                              <button type="submit">Submit</button>
                            </form>
                            <div className = "text-sm">{ (hackathonName)
                            ? <span>Congratulations! You're registered as an attendee of <b>{hackathonName}</b></span> 
                            : (error) 
                              ? <Warning title = "Error">{error}</Warning> 
                              : null }
                            </div>
                        </div>
                    </div>
                    </Tab.Panel>
                    </Tab.Panels>
                    </Tab.Group>

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ProfileIsOpenContext.Provider>
    </>
    )
}