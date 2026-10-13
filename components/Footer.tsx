import { CONTACTS, DISCLAIMER, NAV } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="foot" data-thread-dark>
      <div className="wrap foot__grid">
        <div>
          <p className="foot__k mono">Адрес</p>
          <p>{CONTACTS.addressFull}</p>
          <p className="foot__muted">{CONTACTS.hours}</p>
        </div>
        <div>
          <p className="foot__k mono">Связаться</p>
          <p><a href={CONTACTS.phoneHref}>{CONTACTS.phone}</a></p>
          <p className="foot__links">
            <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href={CONTACTS.vk} target="_blank" rel="noopener noreferrer">ВКонтакте</a>
          </p>
        </div>
        <nav aria-label="Разделы (подвал)">
          <p className="foot__k mono">Разделы</p>
          <ul className="foot__nav">
            {NAV.map((n) => <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>)}
          </ul>
        </nav>
        <p className="foot__legal">{DISCLAIMER}.</p>
        <p className="foot__copy mono">© Чувство формы, Казань</p>
      </div>
    </footer>
  );
}
