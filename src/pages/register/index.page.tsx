import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, Heading, MultiStep, Text, TextInput } from '@call-ui/react'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/lib/axios'

import { Container, FormError, Header, RegisterForm } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter ao menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter ao menos 3 letras' })
    .regex(/^[A-Za-z][A-Za-z]/i, {
      message: 'O nome deve conter apenas letras',
    }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerFormSchema) })

  const router = useRouter()

  useEffect(() => {
    if (router.query?.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('users', {
        username: data.username,
        name: data.name,
      })

      await router.push('/register/connect-calendar')
    } catch (err) {
      // TODO: add toast
      console.log(err)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <RegisterForm as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="call.com/"
            placeholder="seu-usuario"
            {...register('username')}
          />
          {errors.username && <FormError>{errors.username.message}</FormError>}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register('name')} />
          {!!errors.name && <FormError>{errors.name.message}</FormError>}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </RegisterForm>
    </Container>
  )
}
