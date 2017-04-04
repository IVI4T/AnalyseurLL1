var separator, empty, axiome;
var ensembleVide = "∅";
var finSuivant = "$";

$(document).ready(function(){
    $('#grammaire').change(function() {
        AnalyseLL1();  
    }).attr('height','100px')

    function inputs(name,value,callBack){
        callBack(value);
        $("#parameters").append(
            $('<div>').attr('id',name).addClass("form-group")
                .append($('<label>').text(name))
                .append($('<input>').addClass("form-control").attr('name',name).attr('type','text').val(value).change(function(e){
                     callBack($(this).val()); 
                     AnalyseLL1();
                })
            )
        );
    }

    inputs("séparateur ","→",function(value){separator=value;});
    inputs("vide","^",function(value){empty=value;});
    inputs("axiome","program",function(value){axiome=value;})
})

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

function equal(obj1,obj2) {

    if (null == obj1 || null == obj2 || "object" != typeof obj1 || "object" != typeof obj2) return obj1==obj2;
    for (var attr in obj1) {
        if ( !obj1.hasOwnProperty(attr) || !obj2.hasOwnProperty(attr) || !equal(obj1[attr],obj2[attr])) 
            return false; 
    }
    return true;
}

function println(str){
    console.log(str);
}

function AnalyseLL1() {

    (function restore(params) {
        $(".tab-to-empty").empty();
    })();



 

function listRules(str){
    str = str.split("\n");
    var list = Array();
    for (var i in str){
        if(str[i].length!=0){
            rule = str[i].replace(separator," ").split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } ); //enlève fleche et espaces
            first =rule.shift();
            if(list[first]){
                list [first][list[first].length] = rule;
            }else{
                list [first] =Array();
                list [first][0] = rule;
            }
        }
    }
    return list;    
}

function uniq(a) {
    var seen = {};
    a = a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
    return removeEnsembleVide(a);
}
function removeEnsembleVide(a) {
        if(a.length==1 && a[0]==ensembleVide)return a;
        return a.filter( function(e) { return e != ensembleVide; } );
}

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}



function premierInit(rules){
    var premiers = Array();
    for(r in rules){
        premiers[r] = Array();
        premiers[r].push(ensembleVide)
    }
    return premiers;
}

function suivantInit(rules){
    var suivants = Array();
    for(r in rules){
        suivants[r] = Array();
        suivants[r].push(ensembleVide);
    }
    suivants[axiome] = [finSuivant]; 
    return suivants;
}



function printTab(idTarget,idContent,colonnes) {
    
    var line = $('<tr>');

    for(var prem in colonnes){
        line.append($('<td>')
            .text(prem));
    }

    $('<table>')
        .addClass("table table-bordered ")
        .append($('<thead>')
                .append(line))
        .append($('<tbody>')
            .attr("id" ,idContent))
    .appendTo( $('#'+idTarget));

    function printRow(premiers3,css="") {
        var line = $('<tr>').addClass(css);
        for(var prem in premiers3){
            var td = $('<td>');
            for(var elem in premiers3[prem]){
                 td.append( " "+premiers3[prem][elem]);
            }
            line.append(td); 

        }
        $('#'+idContent).append(line);
    }

    return printRow
}


/**
 * Premier
 */


function premier(rules,premiers) {
    for(var r in rules){
         premiers = getFirsts(rules[r],rules,premiers,r);
    }
    return premiers
}

function getFirsts(rule,rules,premiers,currentRuleId){
    for(r in rule){
        var firstelem  = rule[r][0]; // premier élément 
        if(rules[firstelem]){
        
            premiers[currentRuleId] = premiers[currentRuleId].concat(premiers[firstelem])
        }else{
            if(firstelem != empty ){
                premiers[currentRuleId] .push(firstelem)
            }
        }
    }
     premiers[currentRuleId]  = uniq(premiers[currentRuleId] );
    return premiers;
}


/**
 * SUIVANTS
 */

function suivant(rules,premiers,suivants) {
     for(var r in rules){
            suivants = getNext(rules[r],rules,premiers,suivants,r);
    }
    return suivants
}

function canBeEmpty(rule) {
    for(r in rule){
        for(i in rule[r]){
            if(rule[r][i]==empty){
                return true;
            }
        }
    }
    return false;
}

function getNext(currentRule,rules,premiers,suivants,currentRuleId){

    for(r in currentRule){ // pour chaque --> ...*
        var node = currentRule[r];
        for(i in node){ // pour chaque .
            // element de la règle courante
            var elem = node[i];

            if(!rules[elem]){// si c'est un terminal
               continue;
            }    
                
                
                //Rechercher les suivant et les affecter a suivant
                
                function test(next) {
                    
                    if(node[next]){ // s'il y a un caractère après
                        var elemSuivant = node[next];
                        
                        if(rules[elemSuivant]){ // si suivant non terminal -> premiers
                            
                            suivants[elem] = suivants[elem].concat(premiers[elemSuivant]);
                
                            if(canBeEmpty(rules[elemSuivant])){ //si non term et vide possible 
                                test(next+1);// on teste le suivant
                            }

                        }else{//si suivant terminal -> ajout
                            suivants[elem].push(elemSuivant);
                        }


                    }else{ // s'il n'y a pas de caractère --> suivant de la règle
                        suivants[elem] = suivants[elem].concat(suivants[currentRuleId]);

                    } 
                }
                var next = parseInt(i)+1;
                test(next);

                suivants[elem] = uniq(suivants[elem]);





        }
        
    }
    return suivants
}


/**
 * MAIN
 */
var str = $("#grammaire").val();

var rules = listRules(str);
println(rules);
// Premiers
var premiers = premierInit(rules);
var addlinePremier = printTab("tableau","idt",rules);
var prevPremiers;

addlinePremier(premiers);

while(!equal(prevPremiers,premiers)){
    prevPremiers = clone(premiers);
    addlinePremier(premier(rules,premiers));
}

// Suivants
var suivants = suivantInit(rules);
addlineSuivant = printTab("tableauSuivant","idsuiv",rules);
var prevSuivants;

addlineSuivant(suivants);

while(!equal(prevSuivants,suivants)){
    prevSuivants = clone(suivants);
    addlineSuivant(suivant(rules,premiers,suivants));
}



// SDs
var colones={
    "A": 0,
    "ALPHA":0,
    "SD":0,
    "Calcul":0
};


function canBeEmptyn(rule) {
    for(r in rule){
        for(i in rule[r]){
            if(rule[r][i]==empty){
                return true;
            }else{
                canBeEmptyn(rule)

            }
        }
    }
    return false;
}


function sDSnit(rules){
    var sds = Array();
    for(r in rules){
        sds[r] = Array();
    }
    return sds;
}
var sds = sDSnit(rules);

println(sds)
for(rulename in rules){
    var css = "";
    var inters = Array();

    for(rule in rules[rulename]){
        
        if(rules[rulename][rule]==empty){ // si vide
                sds[rulename].push({alpha:rules[rulename][rule],sd:suivants[rulename],comment:"suivants( "+rulename+")"})
                continue;
        }
            
                
        var p = rules[rulename][rule][0];
        if(!rules[p]){ // si  teminal premiers
                sds[rulename].push({alpha:rules[rulename][rule],sd:[p],comment:"premiers("+rules[rulename][rule][0]+")"})
                continue;
        }

        // si non terminal
        function findRec(p,comment=""){
            
            if(canBeEmpty(rules[p])){ //si peu être vide -> ajouter les premiers du suivant
                var arr = Array();
                comment += "premier("+p+")";
                arr = arr.concat(premiers[p])
                next = rules[rulename][rule][1]
                    if(next){ //on prend les premiers de next
                        if(rules[next]){//si next est une rule
                                    comment += " U premiers("+next+")";
                                    arr = arr.concat(premiers[next])
                                    arr = arr.concat(findRec(next),comment)
                                }else{//si terminal
                                    arr.push(next)
                                    comment += " U premiers("+next+")";
                                }
                        }else{
                                //on prend les suivants
                                arr = arr.concat(suivants[p])
                                comment += " U suivants("+rulename+")";
                        }

                            uniq(arr);
                            sds[rulename].push({alpha:rules[rulename][rule],sd:arr,comment:comment})

                }else{
                    comment += "premiers("+p+")";
                    sds[rulename].push({alpha:rules[rulename][rule],sd:premiers[p],comment:comment})

                }
            } 
                
            findRec(p);
        
    }
}

var addligneSD = printTab("tableauSd","idsd",colones);
var css="";
var col = 0;
for(s in sds){
    var sdr = sds[s];
    if(sdr.length==1){
        var sd = sdr[0];
        addligneSD([[s],sd.alpha,sd.sd,[sd.comment]],"");
        continue;
    }

    for(i in sdr){
        var sd = sdr[i];
        var inte = false;
        for(x in sdr){
            if(x != i && intersect(sdr[i].sd,sdr[x].sd).length>0){
                inte = true;
                break;
            }
        }
        addligneSD([[s],sd.alpha,sd.sd,[sd.comment]],inte? "bg-red"+col+" text-white":"");

    }
     col = col++ > 10 ? 0 : col;
}


    
}

