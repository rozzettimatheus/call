import { useRouter } from 'next/router'
import { Heading, MultiStep, Text, Button } from '@call-ui/react'
import { ArrowRight, Check } from 'phosphor-react'
import { signIn, useSession } from 'next-auth/react'

import { Container, Header } from '../styles'
import { AuthError, ConnectBox, ConnectItem } from './styles'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = !!router.query.error
  const isSignedIn = session.status === 'authenticated'

  async function handleConnectCalendar() {
    await signIn('google')
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Connect your calendar!</Heading>
        <Text>
          Connect your calendar to auto verify the scheduled events and the
          recently created ones.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </Header>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>
          {isSignedIn ? (
            <Button variant="secondary" size="sm" disabled>
              Connected
              <Check weight="bold" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectCalendar}
            >
              Connect
              <ArrowRight />
            </Button>
          )}
        </ConnectItem>

        {hasAuthError && (
          <AuthError size="sm">
            Failed to connect to Google, make sure you have enabled the Google
            Calendar access permissions.
          </AuthError>
        )}
        <Button type="button" disabled={!isSignedIn}>
          Next step
          <ArrowRight weight="bold" />
        </Button>
      </ConnectBox>
    </Container>
  )
}
