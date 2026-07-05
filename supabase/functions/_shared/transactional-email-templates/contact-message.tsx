import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  email?: string
  company?: string | null
  message?: string
  deckFilename?: string | null
  deckSizeMB?: string | null
  deckSignedUrl?: string | null
}

const Email = ({
  name = 'Someone',
  email = '',
  company,
  message = '',
  deckFilename,
  deckSizeMB,
  deckSignedUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New message from {name} via salventures.miami</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New message from salventures.miami</Heading>
        <Text style={meta}>
          <strong>From:</strong> {name} &lt;{email}&gt;
        </Text>
        {company ? (
          <Text style={meta}>
            <strong>Company:</strong> {company}
          </Text>
        ) : null}
        <Hr style={hr} />
        <Section>
          {message.split('\n').map((line, i) => (
            <Text key={i} style={body}>
              {line || '\u00A0'}
            </Text>
          ))}
        </Section>
        {deckSignedUrl && deckFilename ? (
          <Section style={deckBox}>
            <Text style={meta}>
              <strong>Pitch deck:</strong> {deckFilename}
              {deckSizeMB ? ` (${deckSizeMB} MB)` : ''}
            </Text>
            <Link href={deckSignedUrl} style={link}>
              Download deck
            </Link>
            <Text style={hint}>Link valid for 30 days.</Text>
          </Section>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `New message from ${(data?.name as string) || 'website visitor'}`,
  displayName: 'Contact form message',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    company: 'Acme Inc.',
    message: 'Hi, I would love to chat about your fund.',
    deckFilename: 'pitch.pdf',
    deckSizeMB: '1.20',
    deckSignedUrl: 'https://example.com/deck',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  color: '#0f172a',
}
const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 24px',
}
const h1: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 600,
  margin: '0 0 20px',
  color: '#0f172a',
}
const meta: React.CSSProperties = {
  fontSize: '14px',
  margin: '4px 0',
  color: '#334155',
}
const body: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  color: '#0f172a',
}
const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '20px 0',
}
const deckBox: React.CSSProperties = {
  marginTop: '24px',
  padding: '16px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
}
const link: React.CSSProperties = {
  color: '#14b8a6',
  fontWeight: 600,
}
const hint: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  margin: '4px 0 0',
}
