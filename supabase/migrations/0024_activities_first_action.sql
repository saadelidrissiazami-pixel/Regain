-- Regain — un catalogue d'activités qu'on peut réellement commencer.
--
-- Le défaut du catalogue précédent n'était pas le manque d'idées, c'était de demander à la
-- personne de concevoir elle-même l'activité au moment précis où elle manque d'élan. « Rangement
-- d'une pièce » a un périmètre infini et une fin incertaine. « Lecture d'un livre » bute sur le
-- choix du livre. « Étirements doux » ne dit pas quels mouvements faire.
--
-- Deux colonnes répondent à ça :
--   first_action — ce qu'on fait dans les deux premières minutes, et qui suffit déjà
--   stop_rule    — ce qui dit que c'est fini, pour que ce ne soit pas sans fin
--
-- Les anciennes activités sont retirées mais conservées : des plannings existants les
-- référencent, et les supprimer casserait la clé étrangère de planned_activities.

alter table public.activities_catalog add column if not exists first_action text;
alter table public.activities_catalog add column if not exists stop_rule text;
alter table public.activities_catalog add column if not exists active boolean not null default true;

-- 0005 crée cet index, mais toutes les bases ne l'ont pas : le projet a d'abord été monté
-- autrement que par la CLI. Sans lui, le `on conflict (title)` plus bas n'a aucune contrainte
-- sur laquelle s'appuyer et la migration échoue en bloc.
create unique index if not exists activities_catalog_title_key on public.activities_catalog (title);

-- Rejouable : tout ce qui n'est pas dans la liste ci-dessous cesse d'être proposé.
update public.activities_catalog set active = false;

insert into public.activities_catalog
  (title, category, duration_minutes, energy_required, indoor_outdoor, cost_level, tags, first_action, stop_rule) values

-- Bouger un peu
('Bouger sur une chanson', 'physique', 4, 'bas', 'indoor', 'gratuit', array['plus_mouvement','plus_energie'],
 'Lance un morceau que tu connais déjà et commence par bouger les mains, assis ou debout.', 'À la fin du morceau.'),
('Marcher dans le logement', 'physique', 5, 'bas', 'indoor', 'gratuit', array['plus_mouvement'],
 'Fais un aller-retour tranquille dans un passage dégagé.', 'Après cinq allers-retours.'),
('Délier ses mains et ses épaules', 'physique', 4, 'bas', 'indoor', 'gratuit', array['plus_mouvement','gerer_stress'],
 'Installe-toi confortablement et ouvre puis referme doucement les mains, dix fois.', 'Quand les épaules ont fait trois cercles.'),
('Faire une petite boucle dehors', 'physique', 8, 'moyen', 'outdoor', 'gratuit', array['plus_mouvement','plus_energie'],
 'Enfile tes chaussures et prends tes clés. Le reste suit tout seul.', 'Quand tu repasses ta porte.'),
('Danser deux morceaux', 'physique', 8, 'moyen', 'indoor', 'gratuit', array['plus_mouvement','plus_energie'],
 'Lance le premier morceau d''une sélection déjà prête.', 'À la fin du deuxième morceau.'),

-- Prendre l'air
('Prendre l''air juste devant', 'outdoor', 5, 'bas', 'outdoor', 'gratuit', array['reduire_ecrans','gerer_stress'],
 'Prends une veste et sors jusqu''au premier endroit où tu peux t''arrêter.', 'Après cinq minutes dehors, même immobile.'),
('Repérer trois détails dehors', 'outdoor', 7, 'bas', 'outdoor', 'gratuit', array['reduire_ecrans','gerer_stress'],
 'Depuis l''endroit où tu es, repère une couleur qui attire ton regard.', 'Quand tu as trouvé les trois.'),
('S''asseoir quelques minutes dehors', 'outdoor', 10, 'bas', 'outdoor', 'gratuit', array['gerer_stress','reduire_ecrans'],
 'Prends une veste et installe-toi sur le banc ou la marche le plus proche.', 'Quand tu as envie de rentrer.'),
('Rejoindre un coin de verdure', 'outdoor', 15, 'moyen', 'outdoor', 'gratuit', array['plus_mouvement','gerer_stress'],
 'Mets tes chaussures et pars vers l''espace vert le plus proche de chez toi.', 'Quand tu es arrivé sur place. Le retour est un bonus.'),

-- À la maison
('Libérer un coin de table', 'indoor', 5, 'bas', 'indoor', 'gratuit', array['routine_stable'],
 'Range un seul objet posé sur la surface que tu as choisie.', 'Quand le coin choisi est dégagé. Le reste attendra.'),
('Remettre cinq objets à leur place', 'indoor', 5, 'bas', 'indoor', 'gratuit', array['routine_stable'],
 'Choisis un objet dont tu connais déjà la place, et range-le.', 'Au cinquième objet.'),
('Installer un coin confortable', 'indoor', 5, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir'],
 'Pose un coussin ou un plaid à l''endroit où tu veux t''installer.', 'Quand tu t''y assieds.'),
('Retrouver un objet auquel on tient', 'indoor', 5, 'bas', 'indoor', 'gratuit', array['confiance_en_soi'],
 'Prends une photo ou un objet familier, et pose-le devant toi.', 'Quand tu l''as regardé un moment.'),
('Préparer quelque chose de chaud', 'indoor', 7, 'bas', 'indoor', 'gratuit', array['gerer_stress','routine_stable'],
 'Remplis la bouilloire ou la casserole. C''est déjà commencé.', 'Quand la tasse est vide.'),

-- Voir quelqu'un, ou juste faire signe
('Envoyer un petit bonjour', 'social', 3, 'bas', 'indifferent', 'gratuit', array['plus_social'],
 'Ouvre une conversation et écris « Je pensais à toi ».', 'Quand le message est parti. Aucune réponse n''est attendue.'),
('Proposer un appel court', 'social', 3, 'bas', 'indifferent', 'gratuit', array['plus_social'],
 'Écris « Ça te dirait un appel de dix minutes un de ces soirs ? »', 'Une fois la proposition envoyée.'),
('Envoyer un message vocal', 'social', 4, 'moyen', 'indifferent', 'gratuit', array['plus_social'],
 'Ouvre la conversation d''un proche et enregistre une première phrase.', 'Quand tu l''envoies, même imparfait.'),
('Appeler dix minutes', 'social', 10, 'moyen', 'indifferent', 'gratuit', array['plus_social'],
 'Appelle la personne avec qui ce moment était convenu.', 'Au bout de dix minutes, sans culpabiliser d''écourter.'),
('Partager une boisson', 'social', 20, 'moyen', 'indifferent', 'faible', array['plus_social'],
 'Au moment convenu, installe-toi et choisis ta boisson.', 'Quand la tasse ou le verre est fini.'),
('Écrire à quelqu''un qu''on a perdu de vue', 'social', 8, 'moyen', 'indifferent', 'gratuit', array['plus_social','confiance_en_soi'],
 'Écris juste « Je pensais à toi, comment tu vas ? » sans expliquer le silence.', 'Une fois envoyé.'),

-- Se poser
('Écouter un morceau sans rien faire', 'relaxation', 5, 'bas', 'indifferent', 'gratuit', array['gerer_stress','reduire_ecrans'],
 'Lance un morceau familier et pose le téléphone hors de tes mains.', 'À la fin du morceau.'),
('Passer un gant tiède sur ses mains', 'relaxation', 5, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir'],
 'Humidifie un gant avec de l''eau à une température agréable.', 'Quand tes mains sont sèches.'),
('Desserrer ses mains et sa mâchoire', 'relaxation', 4, 'bas', 'indifferent', 'gratuit', array['gerer_stress','mieux_dormir'],
 'Pose tes mains sur un support et laisse les doigts se desserrer.', 'Après trois respirations tranquilles.'),
('Regarder dehors par la fenêtre', 'relaxation', 5, 'bas', 'indoor', 'gratuit', array['gerer_stress','reduire_ecrans'],
 'Installe-toi près d''une fenêtre et remarque un détail du dehors.', 'Quand tu as suivi trois choses du regard.'),
('Prendre une douche sans se presser', 'relaxation', 12, 'bas', 'indoor', 'gratuit', array['gerer_stress','mieux_dormir'],
 'Fais couler l''eau et laisse-la chauffer. Tu n''as rien d''autre à décider.', 'Quand tu sors.'),

-- Méditation : ces activités ouvrent les séances guidées, elles ne les recopient pas.
('Sentir un point d''appui', 'meditation', 3, 'bas', 'indifferent', 'gratuit', array['gerer_stress'],
 'Lance la séance et remarque le contact de tes mains ou de tes pieds.', 'À la fin de la séance.'),
('Écouter les sons autour de soi', 'meditation', 4, 'bas', 'indifferent', 'gratuit', array['gerer_stress','reduire_ecrans'],
 'Lance la séance et repère un premier son, les yeux ouverts si tu préfères.', 'À la fin de la séance.'),
('Observer quelques respirations', 'meditation', 4, 'bas', 'indifferent', 'gratuit', array['gerer_stress','mieux_dormir'],
 'Lance la séance et remarque une respiration, sans la modifier.', 'À la fin de la séance.'),
('Revenir à une sensation', 'meditation', 5, 'bas', 'indifferent', 'gratuit', array['gerer_stress','confiance_en_soi'],
 'Choisis le contact des mains ou des pieds comme repère, puis lance la séance.', 'À la fin de la séance.'),

-- Se retrouver
('Noter une chose agréable', 'dev_perso', 3, 'bas', 'indoor', 'gratuit', array['confiance_en_soi'],
 'Complète sur papier : « Aujourd''hui, j''ai apprécié… ». Si rien ne vient, passe.', 'Quand une phrase est écrite.'),
('Nommer ce dont on a besoin', 'dev_perso', 4, 'bas', 'indoor', 'gratuit', array['gerer_stress','confiance_en_soi'],
 'Entoure un mot : repos, compagnie, calme, mouvement, autre chose.', 'Quand le mot est entouré.'),
('Préparer un petit geste pour demain', 'dev_perso', 5, 'bas', 'indoor', 'gratuit', array['routine_stable'],
 'Pose à portée de main un objet utile : un livre, une tenue, une tasse.', 'Quand l''objet est en place.'),
('Écrire une phrase pour poser une limite', 'dev_perso', 5, 'moyen', 'indoor', 'gratuit', array['confiance_en_soi'],
 'Écris « Je peux… » puis « Aujourd''hui, je ne peux pas… ». Tu n''es pas obligé de l''envoyer.', 'Quand les deux phrases sont écrites.'),
('Relire ce qu''on a déjà fait', 'dev_perso', 5, 'bas', 'indoor', 'gratuit', array['confiance_en_soi','routine_stable'],
 'Ouvre ton suivi et regarde la semaine dernière, sans la juger.', 'Quand tu as vu trois choses faites.'),

-- Récupérer
('Se reposer sans chercher à dormir', 'recuperation', 10, 'bas', 'indoor', 'gratuit', array['mieux_dormir','plus_energie'],
 'Installe-toi confortablement et pose le téléphone hors de portée.', 'Quand tu as envie de te relever.'),
('Faire une pause sans écran', 'recuperation', 5, 'bas', 'indifferent', 'gratuit', array['reduire_ecrans'],
 'Pose le téléphone face cachée et laisse tes yeux se poser où ils veulent.', 'Au bout de cinq minutes.'),
('Reposer ses jambes', 'recuperation', 8, 'bas', 'indoor', 'gratuit', array['plus_energie','mieux_dormir'],
 'Assieds-toi ou allonge-toi, les jambes bien soutenues.', 'Quand les jambes se sentent plus légères.'),
('Passer à une lumière plus douce', 'recuperation', 5, 'bas', 'indoor', 'gratuit', array['mieux_dormir','routine_stable'],
 'Éteins une lumière forte et garde un éclairage confortable.', 'Une fois la lumière changée.'),
('Prendre cinq minutes sans tâche', 'recuperation', 5, 'bas', 'indifferent', 'gratuit', array['gerer_stress','reduire_ecrans'],
 'Assieds-toi et laisse la prochaine tâche attendre. Rien à écouter, rien à produire.', 'Au bout de cinq minutes.'),

-- Se changer les idées
('Lire deux pages', 'temps_libre', 7, 'bas', 'indoor', 'gratuit', array['reduire_ecrans'],
 'Ouvre le livre déjà commencé, à la dernière page lue.', 'Au bout de deux pages. Continuer est un bonus.'),
('Dessiner sans modèle', 'temps_libre', 8, 'bas', 'indoor', 'gratuit', array['reduire_ecrans','gerer_stress'],
 'Prends un crayon et trace une première ligne sur une feuille.', 'Quand la feuille te convient, ou pas.'),
('Faire quelques pièces de puzzle', 'temps_libre', 10, 'bas', 'indoor', 'gratuit', array['reduire_ecrans'],
 'Installe-toi devant le puzzle déjà sorti et prends une pièce.', 'Au bout de dix pièces placées, ou avant.'),
('Écouter une histoire courte', 'temps_libre', 10, 'bas', 'indifferent', 'gratuit', array['reduire_ecrans','gerer_stress'],
 'Lance un épisode déjà choisi et pose l''écran.', 'À la fin de l''épisode.'),
('Lire quelques pages de BD', 'temps_libre', 8, 'bas', 'indoor', 'gratuit', array['reduire_ecrans'],
 'Ouvre une BD disponible, à n''importe quelle page.', 'Quand tu refermes.'),
('Regarder un épisode, exprès', 'temps_libre', 30, 'bas', 'indoor', 'gratuit', array['reduire_ecrans','gerer_stress'],
 'Choisis l''épisode à l''avance, puis lance-le.', 'À la fin de l''épisode : c''était un choix, pas un glissement.')

on conflict (title) do update set
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  energy_required = excluded.energy_required,
  indoor_outdoor = excluded.indoor_outdoor,
  cost_level = excluded.cost_level,
  tags = excluded.tags,
  first_action = excluded.first_action,
  stop_rule = excluded.stop_rule,
  active = true;
