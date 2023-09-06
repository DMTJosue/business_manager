# Gestionnaire d'Entreprises

Ce projet est un gestionnaire d'entreprises basé sur une application web. Il permet aux utilisateurs de s'inscrire, de se connecter et de fournir des informations supplémentaires sur leur entreprise.

## Fonctionnalités

- **Inscription:** Les utilisateurs peuvent s'inscrire en fournissant leur prénom, nom, e-mail, nom d'utilisateur et mot de passe. Les champs sont vérifiés pour s'assurer qu'ils sont correctement remplis, et le mot de passe est haché avant d'être enregistré dans la base de données.

- **Connexion:** Les utilisateurs peuvent se connecter en utilisant leur nom d'utilisateur et leur mot de passe. Les informations d'identification sont vérifiées par rapport à la base de données et une session est créée pour l'utilisateur connecté.

- **Informations supplémentaires:** Une fois connectés, les utilisateurs peuvent fournir des informations supplémentaires sur leur entreprise. Ces informations comprennent la commune d'activité, la forme juridique, le bureau de représentation et le type de statut de l'entreprise.

## Étapes de fonctionnement du code

1. **Inscription:** Lorsque l'utilisateur remplit le formulaire d'inscription et soumet les informations, les données sont envoyées au serveur. Le serveur vérifie les champs, génère un sel pour le mot de passe et le hache avant de l'enregistrer dans la base de données. Une fois l'inscription réussie, un fichier JS est créé pour stocker les informations de l'utilisateur.

2. **Connexion:** Lorsque l'utilisateur entre son nom d'utilisateur et son mot de passe et soumet le formulaire de connexion, le serveur vérifie les informations d'identification par rapport à la base de données. Si les informations sont valides, une session est créée pour l'utilisateur connecté.

3. **Informations supplémentaires:** Lorsque l'utilisateur est connecté, il peut fournir des informations supplémentaires sur son entreprise en remplissant le formulaire dédié. Les informations sont ensuite enregistrées dans une nouvelle table liée à l'utilisateur par une clé étrangère.

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé les dépendances requises, notamment Node.js, MySQL et les packages npm utilisés dans le projet. Vous pouvez trouver les détails d'installation dans la section "Configuration" ci-dessous.

## Configuration

1. Assurez-vous d'avoir Node.js installé sur votre machine.

2. Assurez-vous d'avoir une base de données MySQL (gestion_entreprise) configurée et prête à être utilisée avec les tables crées. Mettez à jour le fichier `config.js` avec les informations de connexion à votre base de données.

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenom VARCHAR(255) NOT NULL,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL
);

CREATE TABLE informations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commune_activite VARCHAR(255) NOT NULL,
  forme_juridique VARCHAR(255) NOT NULL,
  bureau_representation VARCHAR(255) NOT NULL,
  type_statut VARCHAR(255) NOT NULL,
  utilisateur_id INT,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);


3. Installez les dépendances du projet en exécutant la commande suivante dans votre terminal :

npm install


## Lancement du serveur

Une fois les dépendances installées et la configuration terminée, vous pouvez lancer le serveur en utilisant la commande suivante :
node server.js

## Note : ce projet peut être amélioré à des fins utiles.

## Auteur [Josué M. DA-MATHA]
