var home_status_general;
exports.action = function(data, callback, config, SARAH) {
  var config = config.modules.linknx;
  var tts;
    
  // Retrieve config
  if (!config.ip_linknx || !config.port_linknx){
    console.log("Missing Linknx config");
    callback({'tts': "il manque la configuration"});
    return;
  }


  if(!data.type_requete_linknx)
  {
    console.log("Missing params");
    callback({'tts': "il manque des paramètres"});
    return;    
  }

  switch (data.type_requete_linknx) {
        /*******************/
        /*     Ecriture    */
        /*******************/
        // ex : http://127.0.0.1:8080/sarah/linknx?type_requete_linknx=ecriture&action_domo=0&type_objet=on_off&objet_linknx=Lumiere_Cuisine_Lustre_Table_Cmd
        case 'ecriture':
            var valeur = data.action_domo;
            var type_objet = data.type_objet;
            var data_xml = "";

            if(type_objet == "dimmer"){
              if(valeur == "1"){
                valeur = "255";
              }
              data_xml = '<write><object id=\"' + data.objet_linknx + '\" value=\"' + valeur + '\"/></write>\04';
              write_linknx(data_xml, config, callback);
            }

            else if(type_objet == "on_off"){
              data_xml = '<write><object id=\"' + data.objet_linknx + '\" value=\"' + valeur + '\"/></write>\04';
              write_linknx(data_xml, config, callback);
            }

            else if(type_objet == "mode"){
              data_xml = '<write><object id=\"' + data.objet_linknx + '\" value=\"' + valeur + '\"/></write>\04';
              write_linknx(data_xml, config, callback);
            }

            else if(type_objet == "volet"){
              data_xml = '<write><object id=\"' + data.objet_linknx + '\" value=\"' + valeur + '\"/></write>\04';
              write_linknx(data_xml, config, callback);
            }

            else if(type_objet == "chauffage"){
              data_xml = '<write><object id=\"' + data.objet_linknx + '\" value=\"' + valeur + '\"/></write>\04';
              write_linknx(data_xml, config, callback);
            }

            else{
              callback({})
              return;
            }
            break;

        /*******************/
        /*     Lecture     */
        /*******************/
        case 'lecture':
            // ex : http://127.0.0.1:8080/sarah/linknx?type_requete_linknx=lecture
            read_linknx(data, config, callback);
            break;

        default:
            callback({});
            break;
  }
}

var write_linknx = function(data_xml, config, callback){
  var net = require('net');
  var answers = config.answers.split('|');
  var HOST = config.ip_linknx;
  var PORT = config.port_linknx; 
  var client = new net.Socket();
  
  client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write(data_xml);
  });

  client.on('data', function(data) {
  //console.log('DATA: ' + data);
  if(data != "<write status='success'/>"){
     answer = answers[ Math.floor(Math.random() * answers.length)];
  }
  else{
    answer = "il y a eu une erreur";
    
  }
    
  callback({ 'tts' : answer })
  // Close the client socket completely
  client.destroy();
  });

  // Add a 'close' event handler for the client socket
  client.on('close', function() {
  console.log('Connection closed');
  });
  return;
} 





var reponse_vocal = function(data_string, piece, config, callback){
  var retour_vocal;
  // on vérifie si linknx retourne success
  var rgxp_status = /<read status="success">/i
  var match = rgxp_status.test(data_string);
  if ( match != true){
    return callback({'tts': "Je ne comprends pas"});
  }

  switch (piece) {
        /*******************/
        /*     Cuisine    */
        /*******************/
        case 'cuisine':
              // Chauffage
              var valeur_chauffage_cuisine = data_string.match('id="chauffage_cuisine_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_cuisine = convert_chauffage(valeur_chauffage_cuisine);
              console.log("Valeur Temperature Cuisine = " + convert_val_chauffage_cuisine)
             
              // Temperature cuisine
              var valeur_temperature_cuisine = data_string.match('id="chauffage_cuisine_temp_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_cuisine = convert_temperature_ambiante(valeur_temperature_cuisine);
              console.log("Valeur Temperature Cuisine = " + convert_val_temperature_cuisine)

              //Volets
              // Porte
              var valeur_volet_porte_cuisine = data_string.match('id="volet_cuisine_porte_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_porte_cuisine = convert_volet(valeur_volet_porte_cuisine);
              console.log("Valeur volet porte Cuisine = " + convert_val_volet_porte_cuisine)
              // Fenetre mouton
              var valeur_volet_mouton_cuisine = data_string.match('id="volet_cuisine_mouton_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_mouton_cuisine = convert_volet(valeur_volet_mouton_cuisine);
              console.log("Valeur volet porte Cuisine = " + convert_val_mouton_cuisine)
              // Fenetre Jardin
              var valeur_volet_pelouse_cuisine = data_string.match('id="volet_cuisine_pelouse_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_pelouse_cuisine = convert_volet(valeur_volet_pelouse_cuisine);
              console.log("Valeur volet porte Cuisine = " + convert_val_pelouse_cuisine)
           
              // spote cuisine
              var valeur_spots_cuisine = data_string.match('id="Lumiere_Cuisine_Spots_Valeur" value="([A-Za-z0-9_.]*)"');
              var convert_val_spots_cuisine = convert_on_off_dimer(valeur_spots_cuisine);
              console.log('Valeur Spots Cuisine = ' + convert_val_spots_cuisine);
              // Lustre cuisine
              var valeur_lustre_cuisine = data_string.match('id="Lumiere_Cuisine_Lustre_Table_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lustre_cuisine = convert_on_off_dimer(valeur_lustre_cuisine);
              console.log('Valeur Lustre Cuisine = ' + convert_val_lustre_cuisine);

              retour_vocal = "Le chauffage de la cuisine est sur le mode " +  convert_val_chauffage_cuisine + ", la température de la cuisine est de " + convert_val_temperature_cuisine + ", le volet de la porte est " + convert_val_volet_porte_cuisine + ", le volet de la fenêtre coté mouton est " + convert_val_mouton_cuisine + ", le volet de la fenêtre coté jardin est " + convert_val_pelouse_cuisine + ", la lumière de la cuisine est " + convert_val_spots_cuisine +", la lumière du lustre de la cuisine est " + convert_val_lustre_cuisine;
              callback({'tts': retour_vocal});
              return;    
              break;

        /*******************/
        /*     Salon       */
        /*******************/
        case 'salon':
              // Chauffage
              var valeur_chauffage_salon = data_string.match('id="chauffage_salon_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_salon = convert_chauffage(valeur_chauffage_salon);
              console.log("Valeur Temperature Salon = " + convert_val_chauffage_salon)

              // Temperature salon
              var valeur_temperature_salon = data_string.match('id="chauffage_salon_temp_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_salon = convert_temperature_ambiante(valeur_temperature_salon);
              console.log("Valeur Temperature Salon = " + convert_val_temperature_salon)

              // Fenetre Baie vitrée
              var valeur_volet_baie_vitrée_salon = data_string.match('id="volet_baie_vitree_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_baie_vitrée_salon = convert_volet(valeur_volet_baie_vitrée_salon);
              console.log("Valeur volet Baie Vitrée Salon = " + convert_val_baie_vitrée_salon)

              // spote salon
              var valeur_spots_salon = data_string.match('id="Lumiere_Salon_Spots_Valeur" value="([A-Za-z0-9_.]*)"');
              var convert_val_spots_salon = convert_on_off_dimer(valeur_spots_salon);
              console.log('Valeur Spots Salon = ' + convert_val_spots_salon);

              retour_vocal = "Le chauffage du salon est sur le mode " +  convert_val_chauffage_salon + ", la température du salon est de " + convert_val_temperature_salon + ", le volet de la baie vitrée est " + convert_val_baie_vitrée_salon + ", la lumière du salon est " + convert_val_spots_salon;
              callback({'tts': retour_vocal});
              return;
              break;

        /*******************/
        /*  salle_a_manger  */
        /*******************/
        case 'salle_a_mangee':
              // Chauffage
              var valeur_chauffage_salle_a_mangee = data_string.match('id="chauffage_salle_a_mangee_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_salle_a_mangee = convert_chauffage(valeur_chauffage_salle_a_mangee);
              console.log("Valeur Temperature Salle a mangee = " + convert_val_chauffage_salle_a_mangee)

              // Temperature salle a mangee
              var valeur_temperature_salle_a_mangee = data_string.match('id="chauffage_salle_a_mangee_temp_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_salle_a_mangee = convert_temperature_ambiante(valeur_temperature_salle_a_mangee);
              console.log("Valeur Temperature Salle a mangee = " + convert_val_temperature_salle_a_mangee)

              // spote salle_a_manger
              var valeur_spots_salle_a_manger = data_string.match('id="Lumiere_Salle_a_Mangee_Spots_Valeur" value="([A-Za-z0-9_.]*)"');
              var convert_val_spots_salle_a_manger = convert_on_off_dimer(valeur_spots_salle_a_manger);
              console.log('Valeur Spots salle_a_manger = ' + convert_val_spots_salle_a_manger);
              // Lustre salle_a_manger
              var valeur_lustre_salle_a_manger = data_string.match('id="Lumiere_Salle_a_Manger_Lustre_Table_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lustre_salle_a_manger = convert_on_off_dimer(valeur_lustre_salle_a_manger);
              console.log('Valeur Lustre salle_a_manger = ' + convert_val_lustre_salle_a_manger);

              retour_vocal = "Le chauffage de la salle à mangée est sur le mode " +  convert_val_chauffage_salle_a_mangee + ", la température de la salle à mangée est de " + convert_val_temperature_salle_a_mangee + ", la lumière de la salle à mangée est " + convert_val_spots_salle_a_manger +", la lumière du lustre de la salle à mangée est " + convert_val_lustre_salle_a_manger;
              callback({'tts': retour_vocal});
              return;    
              break;

         /*************/
        /*     WC    */
        /*************/
        case 'wc':
             // lumières toilette
              var valeur_lumière_toilette = data_string.match('id="Lumiere_WC0_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_toilette = convert_on_off_dimer(valeur_lumière_toilette);
              console.log('Valeur Spots salle_a_manger = ' + convert_val_lumière_toilette);

              retour_vocal = "la lumière des toilettes est " + convert_val_lumière_toilette;
              callback({'tts': retour_vocal});
              return;  
              break;

        /****************/
        /*   banderie   */
        /****************/
        case 'buanderie':
              // Chauffage
              var valeur_chauffage_buanderie = data_string.match('id="chauffage_buanderie_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_buanderie = convert_chauffage(valeur_chauffage_buanderie);
              console.log("Valeur Temperature Buanderie = " + convert_val_chauffage_buanderie)

              // Temperature buanderie
              var valeur_temperature_buanderie = data_string.match('id="chauffage_buanderie_temp_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_buanderie = convert_temperature_ambiante(valeur_temperature_buanderie);
              console.log("Valeur Temperature Buanderie = " + convert_val_temperature_buanderie)

              // Fenetre Buranderie
              var valeur_volet_buanderie = data_string.match('id="volet_buanderie_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_buanderie = convert_volet(valeur_volet_buanderie);
              console.log("Valeur volet Buanderie = " + convert_val_volet_buanderie)

              // lumières banderie
              var valeur_lumière_banderie = data_string.match('id="Lumiere_Buanderie_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_banderie = convert_on_off_dimer(valeur_lumière_banderie);
              console.log('Valeur lumières Buanderie = ' + convert_val_lumière_banderie);

              // lumières petite banderie
              var valeur_lumière_petite_banderie = data_string.match('id="Lumiere_Petite_Buanderie_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_petite_banderie = convert_on_off_dimer(valeur_lumière_petite_banderie);
              console.log('Valeur lumières petite Buanderie = ' + convert_val_lumière_petite_banderie);

              retour_vocal = "Le chauffage de la buanderie est sur le mode " +  convert_val_chauffage_buanderie + ", la température de la buanderie est de " + convert_val_temperature_buanderie + ", le volet de la buanderie est " + convert_val_volet_buanderie +", la lumière de la buanderie est " + convert_val_lumière_banderie +", la lumière de la petite buanderie est " + convert_val_lumière_petite_banderie;
              callback({'tts': retour_vocal});
              return;    
              break;

        /****************/
        /*   bureau   */
        /****************/
        case 'bureau':
              // Chauffage
              var valeur_chauffage_bureau = data_string.match('id="chauffage_bureau_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_bureau = convert_chauffage(valeur_chauffage_bureau);
              console.log("Valeur Temperature Bureau = " + convert_val_chauffage_bureau)

              // Temperature bureau
              var valeur_temperature_bureau = data_string.match('id="chauffage_bureau_temp_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_bureau = convert_temperature_ambiante(valeur_temperature_bureau);
              console.log("Valeur Temperature Bureau = " + convert_val_temperature_bureau)

              // Fenetre Bureau
              var valeur_volet_bureau = data_string.match('id="volet_bureau_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_bureau = convert_volet(valeur_volet_bureau);
              console.log("Valeur volet Bureau = " + convert_val_volet_bureau)

              // lumières Bureau
              var valeur_lumière_bureau = data_string.match('id="Lumiere_Bureau_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_bureau = convert_on_off_dimer(valeur_lumière_bureau);
              console.log('Valeur lumières bureau = ' + convert_val_lumière_bureau);

              retour_vocal = "Le chauffage de la bureau est sur le mode " +  convert_val_chauffage_bureau + ", la température du bureau est de " + convert_val_temperature_bureau + ", le volet du bureau est " + convert_val_volet_bureau + ", la lumière du bureau est " + convert_val_lumière_bureau;
              callback({'tts': retour_vocal});
              return;    
              break;

        /****************/
        /*   couloir   */
        /****************/
        case 'couloir':
              // lumières toilette
              var valeur_lumière_couloir = data_string.match('id="Lumiere_Hall_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_couloir = convert_on_off_dimer(valeur_lumière_couloir);
              console.log('Valeur Spots salle_a_manger = ' + convert_val_lumière_couloir);

              retour_vocal = "la lumière du couloir est " + convert_val_lumière_couloir;
              callback({'tts': retour_vocal});
              return;  
              break;

        /****************/
        /*   chambre   */
        /****************/
        case 'chambre':
              // Chauffage
              var valeur_chauffage_chambre1 = data_string.match('id="chauffage_chambre1_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_chambre1 = convert_chauffage(valeur_chauffage_chambre1);
              console.log("Valeur Temperature Chambre = " + convert_val_chauffage_chambre1)

              // Temperature chambre
              var valeur_temperature_chambre = data_string.match('id="chauffage_chambre1_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_chambre = convert_temperature_ambiante(valeur_temperature_chambre);
              console.log("Valeur Temperature Chambre = " + convert_val_temperature_chambre)

              // Fenetre chambre
              var valeur_volet_chambre = data_string.match('id="volet_chambre1_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_chambre = convert_volet(valeur_volet_chambre);
              console.log("Valeur volet Chambre = " + convert_val_volet_chambre)

              // lumières chambre
              var valeur_lumière_chambre = data_string.match('id="Lumiere_Chambre_1_Spots_Plafond_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_chambre = convert_on_off_dimer(valeur_lumière_chambre);
              console.log('Valeur Spots de la chambre = ' + convert_val_lumière_chambre);

              retour_vocal = "Le chauffage de la Chambre est sur le mode " +  convert_val_chauffage_chambre1 + ", la température de la chambre est de " + convert_val_temperature_chambre + ", le volet de la chambre est " + convert_val_volet_chambre + ", la lumière de la chambre est " + convert_val_lumière_chambre;
              callback({'tts': retour_vocal});
              return;    
              break;

        /*********************/
        /*   salle_de_bain   */
        /*********************/
        case 'salle_de_bain':
              // Chauffage
              var valeur_chauffage_salle_de_bain = data_string.match('id="chauffage_salle_de_bain_mode_choix" value="([A-Za-z0-9_.]*)"');
              var convert_val_chauffage_salle_de_bain = convert_chauffage(valeur_chauffage_salle_de_bain);
              console.log("Valeur Temperature Salle de bain = " + convert_val_chauffage_salle_de_bain)

              // Temperature salle_de_bain
              var valeur_temperature_salle_de_bain = data_string.match('id="chauffage_salle_de_bain_ambiante" value="([A-Za-z0-9_.]*)"');
              var convert_val_temperature_salle_de_bain = convert_temperature_ambiante(valeur_temperature_salle_de_bain);
              console.log("Valeur Temperature salle de bain = " + convert_val_temperature_salle_de_bain)

              // Fenetre salle de bain mouton
              var valeur_volet_salle_de_bain_mouton = data_string.match('id="volet_sdb_mouton_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_salle_de_bain_mouton = convert_volet(valeur_volet_salle_de_bain_mouton);
              console.log("Valeur volet Salle de bain mouton = " + convert_val_volet_salle_de_bain_mouton)

              // Fenetre salle de bain ravel
              var valeur_volet_salle_de_bain_ravel = data_string.match('id="volet_sdb_ravel_status" value="([A-Za-z0-9_.]*)"');
              var convert_val_volet_salle_de_bain_ravel = convert_volet(valeur_volet_salle_de_bain_ravel);
              console.log("Valeur volet Salle de bain ravel = " + convert_val_volet_salle_de_bain_ravel)

              // lumières salle de bain 
              var valeur_lumière_salle_de_bain = data_string.match('id="Lumiere_Salle_de_Bain_Plafond_ex_CH2_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_salle_de_bain = convert_on_off_dimer(valeur_lumière_salle_de_bain);
              console.log('Valeur lumiere salle de bain = ' + convert_val_lumière_salle_de_bain);

              retour_vocal = "Le chauffage de la salle de bain est sur le mode " +  convert_val_chauffage_salle_de_bain + ", la température de la salle de bain est de " + convert_val_temperature_salle_de_bain + ", le volet de la salle de bain côté mouton est " + convert_val_volet_salle_de_bain_mouton + ", le volet de la salle de bain côté ravel est " + convert_val_volet_salle_de_bain_ravel + ", la lumière de la salle de bain est " + convert_val_lumière_salle_de_bain;
              callback({'tts': retour_vocal});
              return;    
              break;
      
        /*********************/
        /*   grenier   */
        /*********************/
        case 'grenier':
              // lumières grenier rue
              var valeur_lumière_grenier_rue = data_string.match('id="Lumiere_Chambre_2_Rue_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_grenier_rue = convert_on_off_dimer(valeur_lumière_grenier_rue);
              console.log('Valeur lumiere grenier rue = ' + convert_val_lumière_grenier_rue);

              // lumières grenier central
              var valeur_lumière_grenier_central = data_string.match('id="Lumiere_Chambre_2_Central_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_grenier_central = convert_on_off_dimer(valeur_lumière_grenier_central);
              console.log('Valeur lumiere grenier central = ' + convert_val_lumière_grenier_central);

              // lumières grenier jardin
              var valeur_lumière_grenier_jardin = data_string.match('id="Lumiere_Chambre_2_Jardin_Status" value="([A-Za-z0-9_.]*)"');
              var convert_val_lumière_grenier_jardin = convert_on_off_dimer(valeur_lumière_grenier_jardin);
              console.log('Valeur lumiere grenier jardin = ' + convert_val_lumière_grenier_jardin);

              retour_vocal = "la lumière du grenier coté rue est " + convert_val_lumière_grenier_rue + ", la lumière du grenier du milieu est " + convert_val_lumière_grenier_central + ", la lumière du grenier coté jardin est " + convert_val_lumière_grenier_jardin;
              callback({'tts': retour_vocal});
              return;  
              break;

        /*********************/
        /*   escalier   */
        /*********************/
        case 'escalier':
              console.log("escalier");
              break;

        /*********************/
        /*   garage   */
        /*********************/
        case 'garage':
              //data_xml = '<read><objects><object id="chauffage_salle_a_mangee_mode_choix"/><object id="chauffage_salle_a_mangee_temp_ambiante"/></objects></read>\04';
              console.log("garage");
              break;

        /*********************/
        /*   maison   */
        /*********************/
        case 'maison':
              // home status
              var convert_val_home_status = convert_status(data_string);
              console.log('Valeur home status maison = ' + convert_val_home_status);

              retour_vocal = "le status de la maison est : " + convert_val_home_status ;
              callback({'tts': retour_vocal});
              return;  
              break;

        /*******************/
        /*     Default     */
        /*******************/
        default:
              callback({});
              break;
    }

} 

var read_linknx = function(data, config, callback){
  var data_xml;
  var piece = data.piece;


  switch (piece) {
        case 'cuisine':
              data_xml = '<read><objects><object id="chauffage_cuisine_mode_choix"/><object id="volet_cuisine_porte_status"/><object id="volet_cuisine_mouton_status"/><object id="volet_cuisine_pelouse_status"/><object id="Lumiere_Cuisine_Spots_Valeur"/><object id="Lumiere_Cuisine_Lustre_Table_Status"/><object id="chauffage_cuisine_temp_ambiante"/></objects></read>\04';
              break;
        case 'salon':
              data_xml = '<read><objects><object id="chauffage_salon_mode_choix"/><object id="chauffage_salon_temp_ambiante"/><object id="volet_baie_vitree_status"/><object id="Lumiere_Salon_Spots_Valeur"/></objects></read>\04';
              break;
        case 'salle_a_mangee':
              data_xml = '<read><objects><object id="chauffage_salle_a_mangee_mode_choix"/><object id="chauffage_salle_a_mangee_temp_ambiante"/><object id="Lumiere_Salle_a_Mangee_Spots_Valeur"/><object id="Lumiere_Salle_a_Manger_Lustre_Table_Status"/></objects></read>\04';
              break;
        case 'wc':
              data_xml = '<read><objects><object id="Lumiere_WC0_Plafond_Status"/></objects></read>\04';
              break;
        case 'buanderie':
              data_xml = '<read><objects><object id="chauffage_buanderie_mode_choix"/><object id="chauffage_buanderie_temp_ambiante"/><object id="volet_buanderie_status"/><object id="Lumiere_Buanderie_Plafond_Status"/><object id="Lumiere_Petite_Buanderie_Plafond_Status"/></objects></read>\04';
              break;
        case 'bureau':
              data_xml = '<read><objects><object id="chauffage_bureau_mode_choix"/><object id="chauffage_bureau_temp_ambiante"/><object id="volet_bureau_status"/><object id="Lumiere_Bureau_Plafond_Status"/></objects></read>\04';
              break;
        case 'couloir':  
              data_xml = '<read><objects><object id="Lumiere_Hall_Plafond_Status"/></objects></read>\04';
              console.log("couloir");
              break;
        case 'chambre':
              data_xml = '<read><objects><object id="chauffage_chambre1_mode_choix"/><object id="chauffage_chambre1_ambiante"/><object id="volet_chambre1_status"/><object id="Lumiere_Chambre_1_Spots_Plafond_Status"/></objects></read>\04';
              break;
        case 'salle_de_bain':
              data_xml = '<read><objects><object id="chauffage_salle_de_bain_mode_choix"/><object id="chauffage_salle_de_bain_ambiante"/><object id="volet_sdb_mouton_status"/><object id="volet_sdb_ravel_status"/><object id="Lumiere_Salle_de_Bain_Plafond_ex_CH2_Status"/></objects></read>\04';
              break;
        case 'grenier':
              data_xml = '<read><objects><object id="Lumiere_Chambre_2_Central_Status"/><object id="Lumiere_Chambre_2_Jardin_Status"/><object id="Lumiere_Chambre_2_Rue_Status"/></objects></read>\04';
              break;
        case 'escalier':
              console.log("escalier");
              break;
        case 'garage':
              //data_xml = '<read><objects><object id="chauffage_salle_a_mangee_mode_choix"/><object id="chauffage_salle_a_mangee_temp_ambiante"/></objects></read>\04';
              console.log("garage");
              break;
        case 'maison':
              data_xml = '<read><objects><object id="home_status_maison"/><object id="home_status_sortie_courte"/><object id="home_status_sortie_longue"/><object id="home_status_nuit"/><object id="home_status_vacance"/><object id="home_status_alarme"/><object id="home_status_soiree"/><object id="home_status_npas_deranger"/><object id="home_status_manuel"/></objects></read>\04';
              break;

        default:
              callback({});
              break;
    }


  
  var net = require('net');
  var answers = config.answers.split('|');
  var HOST = config.ip_linknx;
  var PORT = config.port_linknx; 
  
  var client = new net.Socket();
 
  client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write(data_xml);
  });

  client.on('data', function(data) {
    // on converti data buffer en string
    var taille_data = data.length;
    var data_string = data.toString('utf-8', 0, taille_data-1);
        
    reponse_vocal(data_string, piece, config, callback);
  
    // Close the client socket completely
    client.destroy();
  });
  
  // Add a 'close' event handler for the client socket
  client.on('close', function() {
  console.log('Connection closed');
  });
} 



/**********************************************************/
/*  Fonctions Transformation des données recu par linknx  */
/**********************************************************/
//convertion mode englais en francais
function convert_chauffage(valeur_chauffage) {
  var convert_val_chauffage;
  var rgxp_valeur = /([A-Za-z]*)/i
  var match_valeur = rgxp_valeur.test(valeur_chauffage);
  if ( match_valeur == true){
    // traduction anglais francais
    if(valeur_chauffage[1] == "comfort"){
      valeur_chauffage = "confort"
    }
    else if(valeur_chauffage[1] == "standby"){
      valeur_chauffage = "économique"
    }
    else if(valeur_chauffage[1] == "night"){
      valeur_chauffage = "nuit"
    }
    else if(valeur_chauffage[1] == "frost"){
      valeur_chauffage = "hors-gel"
    }
    else{
      valeur_chauffage = "valeur inconnue"
    }
    convert_val_chauffage = valeur_chauffage
  }
  return convert_val_chauffage;
}

//arrondir temp ambiante a 2 chiffre
function convert_temperature_ambiante(valeur_temperature) {
  var rgxp_valeur_num = /([0-9.]*)/i
  var match_valeur_num = rgxp_valeur_num.test(valeur_temperature);
  if ( match_valeur_num == true){
        valeur_temperature = valeur_temperature[1];
        var valeur_temperature_arrondie = valeur_temperature.split('.');
        valeur_temperature = valeur_temperature_arrondie[0] + ' degrés';
  }
  return valeur_temperature;
}

//convertir les valeur des volet 1 - 100 en ouvert-fermer
function convert_volet(valeur_volet){
  var rgxp_valeur_num = /([0-9.]*)/i
  var match_valeur_num = rgxp_valeur_num.test(valeur_volet);
  if ( match_valeur_num == true){
      // quand la réponse est des chiffres
      if(valeur_volet[1] == "0" ){
        valeur_volet = "ouvert";
      }
      if(valeur_volet[1] > 0 && valeur_volet[1] < 100){
        valeur_volet = "partiellement ouvert";
      }     
      if(valeur_volet[1] == 100 ){
        valeur_volet = "Fermer";
      }
  }
  return valeur_volet;
}

//convertir les valeur des on_off et 0-255 
function convert_on_off_dimer(valeur_on_off_dimer){
  var rgxp_valeur_num = /([0-9.]*)/i
  var match_valeur_num = rgxp_valeur_num.test(valeur_on_off_dimer);
  if ( match_valeur_num == true){
     if(valeur_on_off_dimer[1] == 0 || valeur_on_off_dimer[1] == "off"){
        valeur_on_off_dimer = "éteinte";
      }
      if(valeur_on_off_dimer[1] == 1 || valeur_on_off_dimer[1] == 255 || valeur_on_off_dimer[1] == "on"){
        valeur_on_off_dimer = "allumée";
      }
     if(valeur_on_off_dimer[1] > 1 && valeur_on_off_dimer[1] < 255){
        valeur_on_off_dimer = "partiellement allumée";
      }
  } 
  return valeur_on_off_dimer;
}


 //convertir les valeur des on_off et 0-255 
function convert_status(data_string){
  var home_status;
  var valeur_home_status = data_string.match('id="([A-Za-z_]*)" value="on"');
  if(valeur_home_status[1] == "home_status_maison"){
    home_status = "Maison";
  }
  else if(valeur_home_status[1] == "home_status_sortie_courte"){
    home_status = "Sortie Courte";
  }
  else if(valeur_home_status[1] == "home_status_sortie_longue"){
    home_status = "Sortie Longue";
  }
  else if(valeur_home_status[1] == "home_status_nuit"){
    home_status = "Nuit";
  }
  else if(valeur_home_status[1] == "home_status_vacance"){
    home_status = "Vacance";
  }
  else if(valeur_home_status[1] == "home_status_alarme"){
    home_status = "Alarme";
  }
  else if(valeur_home_status[1] == "home_status_soiree"){
    home_status = "Soirée";
  }
  else if(valeur_home_status[1] == "home_status_npas_deranger"){
    home_status = "Ne Pas Déranger";
  }
  else if(valeur_home_status[1] == "home_status_manuel"){
    home_status = "Manuel";
  }
  home_status_general = home_status;
  return home_status;
}             