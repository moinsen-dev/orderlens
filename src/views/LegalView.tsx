import type { ReactNode } from 'react'
import { Card } from '../components/ui'
import { hasOperatorDetails, site } from '../config/site'

export type LegalDoc = 'imprint' | 'privacy'

export function LegalView({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
      {doc === 'imprint' ? <Imprint /> : <Privacy />}
      <p className="muted text-center text-xs">
        Stand / last updated: {new Date(site.legalUpdated).toLocaleDateString('de-DE')}
      </p>
    </div>
  )
}

/* ── Impressum (§ 5 DDG) ─────────────────────────────────────────────────── */

function Imprint() {
  const o = site.operator
  return (
    <>
      <Card title="Impressum" subtitle="Angaben gemäß § 5 DDG">
        {hasOperatorDetails() ? (
          <address className="text-sm not-italic">
            {o.company && <div className="font-medium">{o.company}</div>}
            <div className={o.company ? '' : 'font-medium'}>{o.name}</div>
            <div>{o.street}</div>
            <div>
              {o.postalCode} {o.city}
            </div>
            <div>{o.country}</div>
          </address>
        ) : (
          <NotConfigured />
        )}
      </Card>

      {hasOperatorDetails() && (
        <Card title="Kontakt">
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <Row label="E-Mail">
              <a className="underline" href={`mailto:${o.email}`}>
                {o.email}
              </a>
            </Row>
            {o.phone && <Row label="Telefon">{o.phone}</Row>}
            {o.vatId && <Row label="Umsatzsteuer-ID (§ 27a UStG)">{o.vatId}</Row>}
            {o.register && <Row label="Registereintrag">{o.register}</Row>}
            {o.responsibleForContent && (
              <Row label="Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)">{o.responsibleForContent}</Row>
            )}
          </dl>
        </Card>
      )}

      <Card title="Haftung für Inhalte und Links">
        <P>
          Die Inhalte dieser Seite wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
          Aktualität der Auswertungen wird keine Gewähr übernommen: sie werden ausschließlich aus der Datei
          berechnet, die Sie selbst laden, und können nur so genau sein wie diese.
        </P>
        <P>
          Diese Seite verweist auf externe Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese
          Inhalte ist stets der jeweilige Anbieter verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der
          Verlinkung nicht erkennbar; bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir solche
          Links umgehend.
        </P>
      </Card>

      <Card title="Software und Lizenz">
        <P>
          {site.name} ist quelloffen und steht unter der MIT-Lizenz. Der Quelltext ist unter{' '}
          <a className="underline" href={site.links.repository} target="_blank" rel="noreferrer noopener">
            {site.links.repository.replace('https://', '')}
          </a>{' '}
          einsehbar. Die Software wird ohne Gewährleistung bereitgestellt.
        </P>
        <P>
          Diese Anwendung steht in keiner Verbindung zu Amazon.com, Inc. und wird von diesem Unternehmen weder
          betrieben noch unterstützt oder geprüft. „Amazon“ ist eine Marke des jeweiligen Rechteinhabers und wird
          hier ausschließlich verwendet, um das Dateiformat zu beschreiben, das dieses Werkzeug liest.
        </P>
      </Card>

      <English>
        <P>
          This is the legally binding German imprint required by § 5 DDG for a site operated from Germany. It
          names the operator, their postal address and how to reach them. {site.name} is open-source software
          under the MIT licence and comes with no warranty; it is not affiliated with Amazon.com, Inc.
        </P>
      </English>
    </>
  )
}

/* ── Datenschutzerklärung (Art. 13 DSGVO) ───────────────────────────────── */

function Privacy() {
  const o = site.operator
  return (
    <>
      <Card title="Datenschutzerklärung" subtitle="Informationen nach Art. 13 DSGVO">
        <P>
          <strong>Das Wesentliche zuerst:</strong> Ihre Bestelldaten verlassen Ihr Gerät nicht. Die Datei, die Sie
          laden, wird ausschließlich im Speicher Ihres Browsers gelesen und ausgewertet. Es gibt keinen Server,
          der sie entgegennehmen könnte — diese Anwendung besteht nur aus statischen Dateien.
        </P>
      </Card>

      <Card title="1. Verantwortlicher">
        {hasOperatorDetails() ? (
          <address className="text-sm not-italic">
            {o.company && <div>{o.company}</div>}
            <div>{o.name}</div>
            <div>{o.street}</div>
            <div>
              {o.postalCode} {o.city}
            </div>
            <div>{o.country}</div>
            <div className="mt-2">
              <a className="underline" href={`mailto:${o.email}`}>
                {o.email}
              </a>
            </div>
          </address>
        ) : (
          <NotConfigured />
        )}
      </Card>

      <Card title="2. Ihre Bestelldaten">
        <P>
          Die von Ihnen geladenen Dateien werden über die Datei-Schnittstelle Ihres Browsers gelesen und
          vollständig lokal verarbeitet. Es findet keine Übertragung an uns oder an Dritte statt. Wir erhalten
          zu keinem Zeitpunkt Kenntnis von deren Inhalt und können ihn auch nicht erlangen.
        </P>
        <P>
          Damit ein Neuladen der Seite Ihren Import nicht verwirft, werden die ausgewerteten Daten in der
          IndexedDB Ihres Browsers abgelegt — ebenfalls ausschließlich auf Ihrem Gerät. Sie können diesen Speicher
          jederzeit über <em>Settings → Delete imported data</em> oder über die Funktion „Websitedaten löschen“
          Ihres Browsers vollständig entfernen.
        </P>
      </Card>

      <Card title="3. Aufruf der Seite (Server-Logfiles)">
        <P>
          Beim Abruf dieser Seite verarbeitet unser Hoster technisch notwendige Zugriffsdaten, insbesondere die
          IP-Adresse, Datum und Uhrzeit des Abrufs, die angeforderte Datei, den Referrer und Angaben zu Browser
          und Betriebssystem. Ohne diese Daten lässt sich eine Website technisch nicht ausliefern.
        </P>
        <P>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im sicheren,
          stabilen und missbrauchsfreien Betrieb der Seite. Eine Zusammenführung dieser Daten mit anderen Quellen
          oder eine Auswertung zu Werbezwecken findet nicht statt.
        </P>
        <P>
          Hoster ist {site.hosting.provider}, {site.hosting.address}. Es besteht ein Vertrag über
          Auftragsverarbeitung nach Art. 28 DSGVO. Soweit dabei Daten in die USA übermittelt werden, stützt sich
          die Übermittlung auf die EU-Standardvertragsklauseln sowie auf die Zertifizierung des Anbieters unter
          dem EU-U.S. Data Privacy Framework. Einzelheiten:{' '}
          <a className="underline" href={site.hosting.privacyPolicy} target="_blank" rel="noreferrer noopener">
            Datenschutzerklärung des Hosters
          </a>
          .
        </P>
      </Card>

      <Card title="4. Speicherung auf Ihrem Endgerät — und warum es kein Cookie-Banner gibt">
        <P>
          Diese Seite setzt keine Cookies. Sie nutzt IndexedDB für die von Ihnen importierten Daten und
          Local Storage für Ihre Anzeigeeinstellungen (Währung, Sprache, Theme, Kategorieregeln). Beides bleibt
          auf Ihrem Gerät.
        </P>
        <P>
          Diese Speicherung ist im Sinne des § 25 Abs. 2 Nr. 2 TDDDG unbedingt erforderlich, um den von Ihnen
          ausdrücklich gewünschten Dienst bereitzustellen — ohne sie wäre Ihr Import nach jedem Neuladen verloren.
          Eine Einwilligung ist dafür nicht erforderlich, und es findet keine darüber hinausgehende Speicherung
          oder Auslesung statt.
        </P>
      </Card>

      <Card title="5. Keine Analyse, kein Tracking, keine externen Ressourcen">
        <P>
          Es kommen weder Analyse- oder Reichweitenmessdienste noch Werbenetzwerke, Social-Media-Plug-ins oder
          eingebettete externe Schriftarten zum Einsatz. Alle Ressourcen werden von der Seite selbst ausgeliefert;
          der Browser stellt beim Aufruf keine Verbindung zu Dritten her.
        </P>
        <P>
          Klicken Sie in der Auswertung einen Produktlink an, verlassen Sie diese Seite und rufen Amazon auf. Dort
          gelten die Datenschutzbestimmungen des jeweiligen Anbieters; auf die dortige Verarbeitung haben wir
          keinen Einfluss.
        </P>
      </Card>

      <Card title="6. Ihre Rechte">
        <P>
          Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung
          der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie das Recht, der Verarbeitung aus
          Gründen Ihrer besonderen Situation zu widersprechen (Art. 21 DSGVO). Wenden Sie sich dafür an die oben
          genannte Adresse.
        </P>
        <P>
          Unabhängig davon steht Ihnen ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu, insbesondere
          in dem Mitgliedstaat Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen
          Verstoßes
          {o.supervisoryAuthority ? `. Für uns zuständig ist ${o.supervisoryAuthority}.` : '.'}
        </P>
        <P>
          Da wir Ihre Bestelldaten nicht erhalten, können wir zu diesen weder Auskunft erteilen noch sie löschen —
          sie liegen ausschließlich bei Ihnen.
        </P>
      </Card>

      <English>
        <P>
          <strong>Short version:</strong> your order data never leaves your device. The file you load is read and
          analysed in your browser; there is no server that could receive it. Results are kept in your browser&apos;s
          IndexedDB so a reload does not lose them, and Settings has a button that wipes them.
        </P>
        <P>
          What is processed is what any website processes to be delivered at all: the access logs of the host
          ({site.hosting.provider}), including your IP address, on the legal basis of Art. 6 (1) (f) GDPR. No
          cookies, no analytics, no tracking, no third-party fonts or scripts. The German text above is the
          binding version.
        </P>
      </English>
    </>
  )
}

/* ── Small building blocks ───────────────────────────────────────────────── */

function P({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm leading-relaxed first:mt-0">{children}</p>
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-3">
      <dt className="muted min-w-[180px] text-xs">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function English({ children }: { children: ReactNode }) {
  return (
    <Card title="English summary" subtitle="Non-binding translation — the German text above prevails.">
      {children}
    </Card>
  )
}

function NotConfigured() {
  return (
    <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
      This deployment has no operator details configured. If you published this instance, fill in{' '}
      <code>src/config/site.ts</code> — a site operated from Germany needs a valid imprint under § 5 DDG.
    </p>
  )
}
