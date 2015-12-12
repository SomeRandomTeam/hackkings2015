var options = {
  numBits: 2048,
  userId: 'Anonymous <anon@example.org>',
  passphrase: ''
};
if(!localStorage.getItem('privateKey')) {
  console.log('Generating PGP keypair');
  openpgp.generateKeyPair(options).then(function(keypair) {
    localStorage.setItem("privateKey", keypair.privateKeyArmored);
    localStorage.setItem("publicKey", keypair.publicKeyArmored);
  }).catch(function(error) {
    console.log(error);
  });
}
$('#publicKeyInput').val(localStorage.getItem('publicKey'));
