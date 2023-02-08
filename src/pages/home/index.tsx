import Image from 'next/image'
import { Heading, Text } from '@call-ui/react'

import previewImg from '../../assets/app-preview.png'

import { Container, Hero, Preview } from './styles'
import { ClaimUsernameForm } from '../../components/ClaimUsernameForm'

export default function Home() {
  return (
    <Container>
      <Hero>
        <Heading size="3xl">Easy Event Scheduling</Heading>
        <Text size="xl">
          Connect your calendar and let people schedule events in your free
          time.
        </Text>

        <ClaimUsernameForm />
      </Hero>

      <Preview>
        <Image
          src={previewImg}
          alt="Calendar representing the app functionalities"
          height={400}
          quality={100}
          priority
        />
      </Preview>
    </Container>
  )
}
