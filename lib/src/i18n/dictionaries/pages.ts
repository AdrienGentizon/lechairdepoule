const en = {
  root_skip_content: "Skip to content",
  home_h1: "Home",
  log_in_h1: "Log in",
  empty_array_message: "Nothing here yet",
  organizations_h1: "My Organizations",
  nav_back: (label: string) => `Back to ${label}`,
  nav_back_landmark: "Page navigation",
  not_found: (label: string) => `${label} not found`,
  organization: "Organization",
  organization_create: "Create an organization",
  organizations_empty_heading: "Welcome",
  organizations_empty: "Create your org to share your events",
  events_empty_heading: "Nothing on the bill yet",
  events_empty: "Create my first event",
  event_create: "Create an event",
  event_create_type_titles: {
    EVENT: "New event",
    RELEASE: "New release",
  },
  event_create_step_type: "Step 1 of 2: choose the event type",
  event_create_step_inputs: "Step 2 of 2: fill in the details",
  event_edit: (title: string) => `Edit ${title}`,
  event_delete: (title: string) => `Delete ${title}`,
  event_published: "Published",
  event_published_aria: (title: string) => `Published ${title}`,
  event_delete_confirm: (title: string) =>
    `You are about to delete "${title}". Continue?`,
};

const fr = {
  root_skip_content: "Aller au contenu",
  home_h1: "Accueil",
  log_in_h1: "Connexion",
  empty_array_message: "Rien pour le moment",
  organizations_h1: "Mes Orgas",
  nav_back: (label: string) => `Retour à ${label}`,
  nav_back_landmark: "Navigation de la page",
  not_found: (label: string) => `${label} introuvable`,
  organization: "Organisation",
  organization_create: "Créer une organisation",
  organizations_empty_heading: "Bienvenue",
  organizations_empty: "Créez votre orga pour partager vos événements",
  events_empty_heading: "Rien à l'affiche pour l'instant",
  events_empty: "Créer mon premier événement",
  event_create: "Créer un événement",
  event_create_type_titles: {
    EVENT: "Nouvel événement",
    RELEASE: "Nouvelle sortie",
  },
  event_create_step_type: "Étape 1 sur 2 : choisir le type d'événement",
  event_create_step_inputs: "Étape 2 sur 2 : remplir les informations",
  event_edit: (title: string) => `Modifier ${title}`,
  event_delete: (title: string) => `Supprimer ${title}`,
  event_published: "Publié",
  event_published_aria: (title: string) => `Publié ${title}`,
  event_delete_confirm: (title: string) =>
    `Vous êtes sur le point de supprimer « ${title} ». Continuer ?`,
} satisfies typeof en;

const dictionaries = { en, fr };

export default dictionaries;
