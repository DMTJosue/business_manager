const express = require('express');
const validator = require('validator');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser=require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const config = require('./config')
const fs = require('fs');
const app = express();

// Configuration des middlewares pour gérer les sessions et les cookies
app.use(cookieParser());
app.use(session({
  secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const connection = mysql.createConnection(config.mysql);

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
    return;
  }
  console.log('Connected to MySQL database.');
});

function recenserInformationsUtilisateur(utilisateur) {
  const contenuFichier = JSON.stringify(utilisateur) + '\n';
  fs.appendFile('utilisateurs.js', contenuFichier, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    }
  });
}
app.post('/inscription', (req, res) => {
    const prenom = req.body.prenom;
    const nom = req.body.nom;
    const email = req.body.email;
    const nomUtilisateur = req.body.nomUtilisateur;
    const motDePasse = req.body.motDePasse;
    const motDePasseConfirmation = req.body.motDePasseConfirmation;
   
    // Vérifier que tous les champs sont remplis
    if (!prenom || !nom || !email || !nomUtilisateur || !motDePasse || !motDePasseConfirmation) {
      console.log('Erreur: tous les champs ne sont pas remplis');
      return res.status(400).json({message :'Veuillez remplir tous les champs du formulaire.'});
    }
  
    // Vérifier que l'adresse email est valide
    if (!validator.isEmail(email)) {
      console.log('Erreur: adresse email invalide');
      return res.status(400).send('Veuillez entrer une adresse email valide.');
    }
  
    // Vérifier que le mot de passe a une longueur minimale de 8 caractères
    if (motDePasse.length < 8) {
      console.log('Erreur: mot de passe trop court');
      return res.status(400).send('Le mot de passe doit contenir au moins 8 caractères.');
    }
  
    // Vérifier que les deux mots de passe sont identiques
    if (motDePasse !== motDePasseConfirmation) {
      console.log('Erreur: les deux mots de passe ne sont pas identiques');
      return res.status(400).send('Les deux mots de passe ne sont pas identiques.');
    }
  
    // Vérifier que le nom d'utilisateur n'existe pas déjà
    connection.query('SELECT * FROM utilisateurs WHERE nom_utilisateur = ?', nomUtilisateur, (err, results) => {
      if (err) {
        console.error('Error checking for existing nom_utilisateur:', err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (results.length > 0) {
        console.log('Erreur: nom d\'utilisateur déjà pris');
        return res.status(400).send('Le nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.');
      }
  
      // Générer un sel pour le hash
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          console.error('Error generating salt:', err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Hasher le mot de passe avec le sel
        bcrypt.hash(motDePasse, salt, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Enregistrer le nouvel utilisateur dans la base de données avec le mot de passe hashé
          const utilisateur = {
            prenom: prenom,
            nom: nom,
            email: email,
            nom_utilisateur: nomUtilisateur,
            mot_de_passe: hash
          };

          console.log('utilisateur:', utilisateur);
  
          connection.query('INSERT INTO utilisateurs SET ?', utilisateur, (err, result) => {
            if (err) {
              console.error('Error inserting utilisateur:', err);
              return res.status(500).send('Internal Server Error');
            }
  
            console.log('Nouvel utilisateur inséré dans la base de données avec l\'ID:', result.insertId);
            res.json({ message: 'Inscription réussie !' });
            recenserInformationsUtilisateur(utilisateur);
          });
        });
      });
    });
});


// ...

app.get('/connexion', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/connexion', (req, res) => {
  const nomUtilisateur = req.body.nomUtilisateur;
  const motDePasse = req.body.motDePasse;

  // Vérifier les informations d'identification
  connection.query('SELECT * FROM utilisateurs WHERE nom_utilisateur = ?', nomUtilisateur, (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      console.log('Erreur: utilisateur non trouvé');
      return res.status(400).send('Nom d\'utilisateur ou mot de passe invalide.');
    }

    const utilisateur = results[0];
    // Vérifier le mot de passe hashé
    bcrypt.compare(motDePasse, utilisateur.mot_de_passe, (err, match) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (!match) {
        console.log('Erreur: mot de passe incorrect');
        return res.status(400).send('Nom d\'utilisateur ou mot de passe invalide.');
      }

      // Stocker l'ID de l'utilisateur dans la session
      req.session.userId = utilisateur.id;
      res.redirect('/informations');
    });
  });
});

app.get('/informations', (req, res) => {
  // Vérifier si l'utilisateur est connecté
  if (!req.session.userId) {
    return res.redirect('/connexion');
  }

  res.sendFile(__dirname + '/public/informations.html');
});

app.post('/informations', (req, res) => {
  // Vérifier si l'utilisateur est connecté
  if (!req.session.userId) {
    return res.redirect('/connexion');
  }

  const communeActivite = req.body.communeActivite;
  const formeJuridique = req.body.formeJuridique;
  const bureauRepresentation = req.body.bureauRepresentation;
  const typeStatut = req.body.typeStatut;
  const userId = req.session.userId;

  // Ajouter les informations supplémentaires dans la nouvelle table
  const informations = {
    commune_activite: communeActivite,
    forme_juridique: formeJuridique,
    bureau_representation: bureauRepresentation,
    type_statut: typeStatut,
    utilisateur_id: userId
  };

  connection.query('INSERT INTO informations SET ?', informations, (err, result) => {
    if (err) {
      console.error('Error inserting informations:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Créer le fichier JS avec les informations de l'utilisateur
    const fichierJS = `const informationsUtilisateur = ${JSON.stringify(informations)};`;
    fs.writeFile(`public/js/informations_${userId}.js`, fichierJS, (err) => {
      if (err) {
        console.error('Error creating JS file:', err);
        return res.status(500).send('Internal Server Error');
      }

      res.send('Informations enregistrées avec succès !');
    });
  });
});



const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
