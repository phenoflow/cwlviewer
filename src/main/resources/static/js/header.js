const searchQueryRepos = 'http://localhost:3003/git/api/v1/orgs/phenoflow/repos';
const searchQueryHeader = 'http://localhost:3003/git/api/v1/repos/phenoflow/';

var m = new Map();
var defaults = new Map();
var URLs = [];

function loadInfo(){
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', searchQueryRepos, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var all = JSON.parse(this.response)
            all.forEach(element => {
                URLs.push(element['clone_url']);
                m.set(element['clone_url'], element['name']);
                defaults.set(element['clone_url'], element['default_branch']);
            });
            load_urls();
        }
    }
    
    xhttp.send();
}