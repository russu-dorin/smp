

module.exports = function(agenda) {
  agenda.define('test job', function(job, done) {
    console.log("TEST JOB EXECUTED!")
    console.log(job)
  });
}
