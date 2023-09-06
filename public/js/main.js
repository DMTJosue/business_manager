const form = document.getElementById('inscription-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const prenom = document.getElementById('prenom').value;
  const nom = document.getElementById('nom').value;
  const email = document.getElementById('email').value;
  const nomUtilisateur = document.getElementById('nomUtilisateur').value;
  const motDePasse = document.getElementById('motDePasse').value;
  const motDePasseConfirmation = document.getElementById('motDePasseConfirmation').value;

  // Effectuer la validation et l'envoi des données au serveur

  fetch('/inscription', {
    method: 'POST',
    body: new URLSearchParams({
      prenom: prenom,
      nom: nom,
      email: email,
      nomUtilisateur: nomUtilisateur,
      motDePasse: motDePasse,
      motDePasseConfirmation: motDePasseConfirmation
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Une erreur est survenue lors de l\'envoi de la requête.');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    alert('Inscription réussie !');
  })
  .catch(error => {
    console.error(error);
    if (error.message === 'Failed to fetch') {
      alert('Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet et réessayer.');
    } else if (error.message === 'Une erreur est survenue lors de l\'envoi de la requête.') {
      alert('Une erreur s\'est produite lors de l\'envoi de la requête. Veuillez réessayer plus tard.');
    } else {
      let messageErreur = 'Une erreur s\'est produite. Veuillez réessayer plus tard.';
      if (error.response && error.response.status === 409) {
        messageErreur = 'Le nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.';
      } else if (error.response && error.response.status === 400) {
        const messageErreurServeur = error.response.data.message;
        if (messageErreurServeur === 'Les mots de passe ne correspondent pas.') {
          messageErreur = 'Les mots de passe ne correspondent pas. Veuillez les saisir à nouveau.';
        } else if (messageErreurServeur === 'L\'adresse e-mail est invalide.') {
          messageErreur = 'L\'adresse e-mail est invalide. Veuillez saisir une adresse e-mail valide.';
        }
      }
      alert(messageErreur);
    }
  });
});
