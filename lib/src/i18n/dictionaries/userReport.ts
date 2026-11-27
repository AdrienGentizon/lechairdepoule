const en = {
  contact_us: "Contact us",
  description: "Form to report a bug, ask a question or suggest a feature",
  type_legend: "Request type",
  types: {
    BUG: "Report a bug",
    QUESTION: "Ask a question",
    FEATURE: "Suggest a feature",
  },
  message_label: "Message",
  body_error: "Between 10 and 2000 characters",
  submit: "Send",
  submitted: "Thanks, your message has been sent.",
  unknown_error: "Unknown error, please try again.",
};

const fr = {
  contact_us: "Nous contacter",
  description:
    "Formulaire pour signaler un bug, poser une question ou proposer une fonctionnalité",
  type_legend: "Type de demande",
  types: {
    BUG: "Signaler un bug",
    QUESTION: "Poser une question",
    FEATURE: "Proposer une fonctionnalité",
  },
  message_label: "Message",
  body_error: "Entre 10 et 2000 caractères",
  submit: "Envoyer",
  submitted: "Merci, votre message a bien été transmis.",
  unknown_error: "Erreur inconnue, veuillez réessayer.",
} satisfies typeof en;

const dictionaries = { en, fr };

export default dictionaries;
