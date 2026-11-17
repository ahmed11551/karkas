import type { Language } from '../types';
import { COMPANY_CONFIG } from '../config/company';

/**
 * Text of the legal documents shown in LegalDocumentModal (/privacy and /terms).
 *
 * The texts are drafted to match Federal Law No. 152-FZ and the actual behaviour of the site
 * (forms, Yandex.Metrika, Telegram notifications, CRM). They are NOT legal advice: a lawyer must
 * review them before launch. Points that depend on business decisions are marked in the
 * "REVIEW" comments below and listed in the project README.
 */

export type LegalDocType = 'privacy' | 'terms';

type Bi = Record<Language, string>;

export interface LegalSection {
  heading: Bi;
  paragraphs?: Bi[];
  items?: Bi[];
}

export interface LegalDocument {
  title: Bi;
  sections: LegalSection[];
}

/** Publication date of the current text. Update it on every change. */
export const LEGAL_UPDATED: Bi = {
  ru: 'Редакция от 15.11.2026',
  en: 'Version of 15 Nov 2026',
};

export const LEGAL_DOCS: Record<LegalDocType, LegalDocument> = {
  privacy: {
    title: {
      ru: 'Политика обработки персональных данных',
      en: 'Privacy & Personal Data Policy',
    },
    sections: [
      {
        heading: { ru: '1. Общие положения', en: '1. General provisions' },
        paragraphs: [
          {
            ru: 'Настоящая Политика обработки персональных данных (далее — Политика) составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных». Она действует в отношении всех данных, которые ООО «Каркасник» (далее — Оператор) получает от посетителей сайта.',
            en: 'This Personal Data Processing Policy (the "Policy") is issued under Federal Law No. 152-FZ "On Personal Data" of the Russian Federation. It applies to all personal data that Karkasnik LLC (the "Operator") receives from visitors of its website.',
          },
        ],
      },
      {
        heading: { ru: '2. Какие данные мы обрабатываем', en: '2. Data we process' },
        paragraphs: [
          {
            ru: 'Мы обрабатываем только те данные, которые вы передаёте сами в формах сайта, и технические данные, необходимые для работы сайта:',
            en: 'We process only the data you enter in the website forms and the technical data needed to run the website:',
          },
        ],
        items: [
          {
            ru: 'номер телефона и имя (если вы его указали) — для связи, обратного звонка и отправки сметы;',
            en: 'phone number and name (if you provided it) — to contact you, call you back and send the estimate;',
          },
          {
            ru: 'параметры будущего дома из калькулятора и квиза: площадь, толщина утепления, фундамент, веранда, расстояние от МКАД, ответы на вопросы квиза;',
            en: 'parameters of the planned house from the calculator and quiz: area, insulation, foundation, veranda, distance from the Moscow Ring Road, quiz answers;',
          },
          {
            ru: 'UTM-метки и адрес страницы, с которой вы перешли на сайт;',
            en: 'UTM tags and the address of the page from which you came to the website;',
          },
          {
            ru: 'IP-адрес и тип браузера — для защиты от спама и ограничения частоты отправки заявок;',
            en: 'IP address and browser type — to protect against spam and to limit how often requests can be sent;',
          },
          {
            ru: 'обезличенная статистика посещений через Яндекс.Метрику (если сервис подключён на сайте).',
            en: 'anonymous visit statistics through Yandex.Metrika (if the service is enabled on the website).',
          },
        ],
      },
      {
        heading: { ru: '3. Цели обработки', en: '3. Purposes of processing' },
        items: [
          {
            ru: 'подготовка предварительной сметы и расчёта стоимости дома;',
            en: 'preparing a preliminary estimate and price calculation for the house;',
          },
          {
            ru: 'обратный звонок, ответы на вопросы, отправка сметы в мессенджер;',
            en: 'callbacks, answering questions, sending the estimate by messenger;',
          },
          {
            ru: 'фиксация акционных подарков за номером телефона клиента;',
            en: 'reserving promotional gifts for the client\'s phone number;',
          },
          {
            ru: 'защита сайта от злоупотреблений и анализ посещаемости в обезличенном виде.',
            en: 'protecting the website from abuse and analysing traffic in anonymous form.',
          },
        ],
      },
      {
        heading: { ru: '4. Правовое основание', en: '4. Legal basis' },
        paragraphs: [
          {
            ru: 'Основание обработки — ваше согласие. Вы даёте его, отмечая чекбокс в форме. Без согласия форма не отправляется. Согласие можно отозвать в любой момент письмом на адрес, указанный в разделе 8. После отзыва мы прекращаем обработку и удаляем данные, если нет иных законных оснований их хранить.',
            en: 'The legal basis for processing is your consent, which you give by ticking the checkbox in the form. Without consent the form is not sent. You may withdraw consent at any time by writing to the address in section 8. After withdrawal we stop processing and delete the data, unless we have another legal ground to keep it.',
          },
        ],
      },
      {
        heading: { ru: '5. Хранение и защита', en: '5. Storage and protection' },
        paragraphs: [
          {
            // REVIEW: retention period is a business decision; confirm before launch.
            ru: 'Заявки хранятся в базе Оператора до достижения целей обработки и не дольше 3 лет после последнего обращения клиента либо до отзыва согласия, в зависимости от того, что наступит раньше. Доступ к заявкам имеют только сотрудники, которым это нужно для работы. Оператор применяет организационные и технические меры защиты: ограничение доступа, шифрованное соединение (HTTPS), ограничение частоты запросов и журналирование.',
            en: 'Requests are stored in the Operator\'s database until the purposes of processing are achieved, and no longer than 3 years after the client\'s last contact, or until consent is withdrawn — whichever comes first. Only staff who need access for their work can see requests. The Operator applies organisational and technical protection measures: restricted access, encrypted connection (HTTPS), request rate limits and logging.',
          },
        ],
      },
      {
        heading: { ru: '6. Передача третьим лицам', en: '6. Disclosure to third parties' },
        paragraphs: [
          {
            ru: 'Оператор не продаёт персональные данные и не передаёт их третьим лицам для их маркетинга. Данные передаются только поставщикам, без которых сайт не работает или заявка не обрабатывается:',
            en: 'The Operator does not sell personal data or pass it to third parties for their marketing. Data is shared only with service providers without which the website cannot operate or a request cannot be handled:',
          },
        ],
        items: [
          {
            ru: 'хостинг-провайдеру, на серверах которого работают сайт и база заявок;',
            en: 'hosting provider on whose servers the website and the request database run;',
          },
          {
            ru: 'ООО «Яндекс» — сервис Яндекс.Метрика, только обезличенная статистика (если подключён);',
            en: 'Yandex LLC — Yandex.Metrika service, anonymous statistics only (if enabled);',
          },
          {
            ru: 'мессенджер Telegram — уведомление о новой заявке уходит в закрытый чат сотрудников Оператора (если уведомления подключены). Мессенджер обрабатывает сообщения по собственным правилам.',
            en: 'Telegram messenger — a notification about a new request goes to a private staff chat of the Operator (if notifications are enabled). The messenger processes messages under its own rules.',
          },
        ],
      },
      {
        heading: { ru: '7. Файлы cookie и локальное хранилище', en: '7. Cookies and local storage' },
        paragraphs: [
          {
            ru: 'Сайт сохраняет в браузере настройки (язык, тему, звук), последний расчёт и UTM-метки. Яндекс.Метрика использует cookie-файлы для статистики. Сессия сотрудника CRM хранится в cookie, которое недоступно скриптам страницы. Вы можете удалить cookie и данные сайта в настройках браузера.',
            en: 'The website stores in your browser your settings (language, theme, sound), your last calculation and UTM tags. Yandex.Metrika uses cookies for statistics. The staff CRM session is kept in a cookie that page scripts cannot read. You can delete cookies and site data in your browser settings.',
          },
        ],
      },
      {
        heading: { ru: '8. Ваши права и контакты', en: '8. Your rights and contacts' },
        paragraphs: [
          {
            ru: 'Вы вправе получить сведения о том, какие данные о вас обрабатываются, потребовать их уточнения, блокировки или удаления, а также отозвать согласие. Запрос направьте на адрес info@karkasnik.ru. Мы ответим в сроки, установленные законом (не позднее 30 дней).',
            en: 'You have the right to obtain information about the personal data we hold about you, to ask for it to be corrected, blocked or deleted, and to withdraw consent. Send your request to info@karkasnik.ru. We will reply within the time limits set by law (no later than 30 days).',
          },
        ],
      },
      {
        heading: { ru: '9. Изменения Политики', en: '9. Changes to this Policy' },
        paragraphs: [
          {
            ru: 'Оператор может обновлять Политику. Актуальная версия всегда опубликована на сайте, дата редакции указана вверху документа.',
            en: 'The Operator may update this Policy. The current version is always published on the website; the date of the version is shown at the top of the document.',
          },
        ],
      },
    ],
  },

  terms: {
    title: {
      ru: 'Пользовательское соглашение',
      en: 'Terms of Service',
    },
    sections: [
      {
        heading: { ru: '1. Общие положения', en: '1. General provisions' },
        paragraphs: [
          {
            ru: 'Настоящее Пользовательское соглашение определяет условия использования сайта ООО «Каркасник»: каталога проектов, интерактивного калькулятора, квиза и формы заявки. Пользуясь сайтом, вы принимаете эти условия. Если вы не согласны с ними, прекратите использование сайта.',
            en: 'These Terms of Service set out the conditions for using the website of Karkasnik LLC: the project catalogue, the interactive calculator, the quiz and the request form. By using the website you accept these Terms. If you do not agree, please stop using the website.',
          },
        ],
      },
      {
        heading: { ru: '2. Статус расчётов и смет', en: '2. Status of estimates' },
        paragraphs: [
          {
            ru: 'Расчёт в калькуляторе, результат квиза и смета в PDF носят предварительный и справочный характер. Они не являются публичной офертой в смысле статьи 437 Гражданского кодекса РФ и не создают обязательств сторон. Окончательная стоимость и комплектация определяются договором подряда после замера участка или согласования спецификации.',
            en: 'Results of the calculator, quiz answers and the PDF estimate are preliminary and informational. They are not a public offer within the meaning of Article 437 of the Civil Code of the Russian Federation and do not create obligations for either party. The final price and specification are set by the construction contract after the site survey or agreement of the specification.',
          },
        ],
      },
      {
        heading: { ru: '3. Фиксация цены и подарков', en: '3. Price and gift reservation' },
        paragraphs: [
          {
            // REVIEW: 14-day validity and gift terms must match the actual promotion.
            ru: 'Кнопки «Закрепить цену» и «Закрепить подарки» фиксируют расчёт за вашим номером телефона на 14 календарных дней. Фиксация не бронирует участок и не обязывает вас заключать договор. Условия акций (подарки, скидка на сваи) действуют при заключении договора в период акции. Подробности сообщает менеджер и они указываются в договоре.',
            en: 'The "Lock price" and "Lock gifts" buttons reserve the calculation for your phone number for 14 calendar days. A reservation does not book a plot and does not oblige you to sign a contract. Promotion terms (gifts, pile discount) apply to contracts signed during the promotion period. The manager explains the details, and they are set out in the contract.',
          },
        ],
      },
      {
        heading: { ru: '4. Цены, оплата и гарантия', en: '4. Prices, payment and warranty' },
        paragraphs: [
          {
            // REVIEW: payment scheme and warranty period must match the signed contract template.
            ru: `Цены указаны за готовый дом под ключ на дату публикации и могут меняться. Для вас действует цена, зафиксированная в договоре. Порядок оплаты по умолчанию: без предоплаты за домокомплект, окончательный расчёт после монтажа на участке и подписания акта приёмки работ. Гарантия на конструкции — ${COMPANY_CONFIG.warrantyMonths} месяцев с даты подписания акта приёмки.`,
            en: `Prices are for a turnkey house and are valid on the date of publication; they may change. The price fixed in your contract applies to you. Default payment scheme: no prepayment for the house kit, final payment after assembly on the plot and signing of the acceptance certificate. Structural warranty — ${COMPANY_CONFIG.warrantyMonths} months from the date of the acceptance certificate.`,
          },
        ],
      },
      {
        heading: { ru: '5. Иллюстрации и характеристики', en: '5. Illustrations and specifications' },
        paragraphs: [
          {
            ru: 'Фотографии, 3D-разрезы, планировки и видео на сайте иллюстративны и могут отличаться от конкретного проекта. Характеристики материалов указаны на дату публикации и могут уточняться в договоре.',
            en: 'Photos, 3D cutaways, floor plans and videos on the website are illustrative and may differ from a specific project. Material specifications are as of the publication date and may be clarified in the contract.',
          },
        ],
      },
      {
        heading: { ru: '6. Интеллектуальная собственность', en: '6. Intellectual property' },
        paragraphs: [
          {
            ru: 'Архитектурные планировки, 3D-разрезы конструкций, сметные калькуляции и визуальные материалы сайта являются интеллектуальной собственностью ООО «Каркасник». Копирование и использование без письменного разрешения не допускаются, кроме личного ознакомления.',
            en: 'The architectural floor plans, 3D structural cutaways, engineering estimates and visual materials on the website are the intellectual property of Karkasnik LLC. Copying or using them without written permission is not allowed, except for personal review.',
          },
        ],
      },
      {
        heading: { ru: '7. Ограничение ответственности', en: '7. Limitation of liability' },
        paragraphs: [
          {
            ru: 'Информация на сайте предоставляется «как есть» и носит справочный характер. Оператор не отвечает за временную недоступность сайта и за решения, принятые исключительно на основании предварительного расчёта.',
            en: 'Information on the website is provided "as is" for reference only. The Operator is not liable for temporary unavailability of the website or for decisions made solely on the basis of a preliminary calculation.',
          },
        ],
      },
      {
        heading: { ru: '8. Персональные данные', en: '8. Personal data' },
        paragraphs: [
          {
            ru: 'Порядок обработки персональных данных описан в Политике обработки персональных данных, которая является неотъемлемой частью настоящего соглашения.',
            en: 'The way personal data is processed is described in the Privacy & Personal Data Policy, which forms an integral part of these Terms.',
          },
        ],
      },
      {
        heading: { ru: '9. Применимое право и споры', en: '9. Governing law and disputes' },
        paragraphs: [
          {
            ru: 'Отношения регулируются законодательством Российской Федерации. Претензии направляются Оператору на info@karkasnik.ru и рассматриваются в течение 30 дней. Если соглашение не достигнуто, спор передаётся в суд по месту нахождения Оператора.',
            en: 'These relations are governed by the law of the Russian Federation. Claims are sent to the Operator at info@karkasnik.ru and are reviewed within 30 days. If no agreement is reached, the dispute is referred to the court at the Operator\'s registered address.',
          },
        ],
      },
    ],
  },
};
