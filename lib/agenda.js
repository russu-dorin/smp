
var secrets = require('../config/secrets');
var Agenda = require('agenda');

var agenda = new Agenda();

agenda.database(secrets.db, 'agenda_jobs');


require('./jobs/scheduled_post')(agenda);
require('./jobs/test_job')(agenda);


agenda.start();

module.exports = agenda;
