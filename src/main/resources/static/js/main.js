/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * RequireJS configuration with all possible dependencies
 */
requirejs.config({
    baseUrl: '/phenoflow/bower_components',
    paths: {
        'jquery': 'jquery/dist/jquery.min'
    }
});

/**
 * Validation for form
 */
require(['jquery'],
    function ($) {
        var gitPattern = new RegExp("^((git|ssh|http(s)?)|(git@[\\w\\.]+))(:(//)?)([\\w\\.@\\:/\\-~]+)(\\.git)(/)?$");

        /**
         * Show extra details in form if generic git repository
         */
        $("#url").on('change keyup paste', function () {
            var input = $(this).val();
            if (gitPattern.test(input)) {
                $("#extraInputs").fadeIn();
            } else {
                $("#extraInputs").fadeOut();
            }
        });

        /**
         * Clear warnings when fields change
         */
        $("select").on('change',function(e) {
            var field = $(this);
            field.parent().removeClass("has-error");
            field.next().text("");
        });

        /**
         * Validate form before submit
         */
        $('#add').submit(function() {
            var input = $("#url").val();
            if (input == "") {
                addWarning("url", "Must select a phenotype to proceed");
                return false;
            }
            return true;
        });

        /**
         * Adds warning state and message to the a field
         * @param id The ID of the field
         * @param message The message to be displayed on the form element
         */
        function addWarning(id, message) {
            var field = $("#" + id);
            field.parent().addClass("has-error");
            field.next().text(message);
        }

        $("#url").trigger("change");
    });



const org = 'phenoflow';
const searchQueryRepos = config.githubBaseUrl + '/orgs/' + org + '/repos';
const searchQueryHeader = config.githubBaseUrl + '/repos/' + org + '/';

var m = new Map();
var defaults = new Map();
var URLs = [];

function loadInfo(){
    document.getElementById('url').disabled = true
    if((storedURLs = localStorage.getItem("URLs")) && (storedM = localStorage.getItem("m")) && (storedDefaults = localStorage.getItem("defaults"))) {
        URLs = JSON.parse(storedURLs);
        m = new Map(JSON.parse(storedM));
        defaults = new Map(JSON.parse(storedDefaults));
        loadUrls();
        document.getElementById('url').disabled = false
    } else {
        Promise.all(Array.from({ length: 12 }, function(element, index) {
            return new Promise(function(resolve, reject) {
                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let all = JSON.parse(this.response);
                        all.forEach(element => {
                            if(element['name'].includes('---')) {
                                let cloneUrl = element['clone_url'].replace(config.githubHost, config.internalGithubHost)
                                URLs.push(cloneUrl);
                                m.set(cloneUrl, element['name']);
                                defaults.set(cloneUrl, element['default_branch']);
                            }
                        });
                        resolve()
                    }
                }
                xhttp.open('GET', searchQueryRepos + '?per_page=100&page=' + (index+1), true);
                xhttp.send();
            });
        })).then(function() {
            URLs.sort((phenotypeA, phenotypeB) => {
                let lowerA = phenotypeA.toLowerCase();
                let lowerB = phenotypeB.toLowerCase();
                return lowerA < lowerB ? -1 :
                    lowerA > lowerB ? 1  :
                    phenotypeA < phenotypeB ? -1 :
                    phenotypeA > phenotypeB ? 1 : 0;
            });
            localStorage.setItem("URLs", JSON.stringify(URLs));
            localStorage.setItem("m", JSON.stringify(Array.from(m.entries())));
            localStorage.setItem("defaults", JSON.stringify(Array.from(defaults.entries())));
            loadUrls();
            document.getElementById('url').disabled = false
        })
        .catch(function(error) {
            console.error(error)
        })
    }
}


var url_selection = document.getElementById('url');
var branch_selection = document.getElementById('branch');
var path = document.getElementById('path');
var button = document.getElementById('parse');

function loadUrls(){
    for(var i=0;i<URLs.length;++i){
        var url = URLs[i];
        var name = m.get(url);
        var option = '<option value="'+ URLs[i]+'">'+ name +'</option>';
        url_selection.innerHTML += option;
    }
}

function loadBranch(){
    if (url_selection.value == ''){
        button.disabled = false;
    }
    else{
        var branches = [];
        branch_selection.innerHTML = '';
        var quest = searchQueryHeader + m.get(url_selection.value) + '/branches';
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', quest, true);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var a = JSON.parse(this.response);
                if (a.length > 1){
                    a.forEach(element => {
                        branches.push(element['name']);
                    });
                }
                else {
                    branches.push(a[0]['name']);
                }
                for(var i=0;i<branches.length;++i){
                    var option = '';
                    if (branches[i] == defaults.get(url_selection.value)){
                        option = '<option value="'+ branches[i]+'" selected>'+branches[i]+'</option>';
                    }
                    else{
                        option = '<option value="'+ branches[i]+'">'+branches[i]+'</option>';
                    }
                    branch_selection.innerHTML += option;
                }
                selectPath();

            }
        }
        
        xhttp.send();
    }
    
}

function startWithUpper(c){
    if (c.charAt(0) == c.charAt(0).toUpperCase()){
        return true;
    }
    return false;
}

function isMainCWL(s){
    if (startWithUpper(s) && s.endsWith('.cwl') && !s.includes('inputs')){
        return true;
    }
    return false;
}

function selectPath(){
    if (url_selection.value != '' && branch_selection.value != ''){
        path.innerHTML = '';
        var quest = searchQueryHeader + m.get(url_selection.value) + '/git/trees/' + branch_selection.value;
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', quest, true);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) 
            {
                var a = JSON.parse(this.response);
                if (a['tree'].length < 1){
                    path.value = 'Empty branch';
                    button.disabled = true;
                }
                else{
                    path.value= 'No main file found';
                    button.disabled = true;
                    for (var i = 0; i < a['tree'].length; ++i){
                        if (isMainCWL(a['tree'][i]['path'])){
                            path.value = a['tree'][i]['path'];
                            button.disabled = false;
                            break;
                        }
                    }
                }
                
            }
        }
        xhttp.send();

    }
    else{
        button.disabled = false;
    }
    
    

    
}
    
loadInfo();