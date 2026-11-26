const en = {
  root_skip_content: "Skip to content",
  home_h1: "Home",
  log_in_h1: "Log in",
  empty_array_message: "Nothing here yet",
  organizations_h1: "Organizations",
  nav_back: (label: string) => `Back to ${label}`,
  nav_back_landmark: "Page navigation",
};

const fr = {
  root_skip_content: "Aller au contenu",
  home_h1: "Accueil",
  log_in_h1: "Connexion",
  empty_array_message: "Rien pour le moment",
  organizations_h1: "Organisations",
  nav_back: (label: string) => `Retour à ${label}`,
  nav_back_landmark: "Navigation de la page",
} satisfies typeof en;

const dictionaries = { en, fr };

export default dictionaries;
