/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado(a) para a NutriLeague</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>NutriLeague</Heading>
        <Heading style={h1}>Você foi convidado(a)</Heading>
        <Text style={text}>
          Você recebeu um convite para participar da{' '}
          <Link href={siteUrl} style={link}>
            <strong>NutriLeague</strong>
          </Link>
          . Clique no botão abaixo para aceitar e criar sua conta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Aceitar convite
        </Button>
        <Text style={footer}>
          Se você não esperava este convite, pode ignorar este email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '520px' }
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(24, 100%, 56%)',
  margin: '0 0 24px',
  letterSpacing: '-0.02em',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#111111',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#4a4a4a',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: 'hsl(24, 100%, 56%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(24, 100%, 56%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.5' }
