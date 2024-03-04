require([
  'jquery',
  'underscore',
   'splunkjs/mvc',
 ],
 function(
  $,
  _,
  mvc
 ) {
	 
	 $(document).on('click', ".btn-secondary", function (){
		$(".btn-secondary").removeClass("active")
		$(this).addClass("active")
		});
           var tokens = mvc.Components.getInstance("default");
          var selected_value
          var SearchManager = require('splunkjs/mvc/searchmanager');
         console.log("I m in")
$("#select_file").show()
$("#import_file").hide()
$("#git_process").hide()

var fileInput = document.getElementById("fileupload")
file_content_array = []
var file_content
function readFile() {
console.log("i m in")
          var reader = new FileReader();
          reader.onload = function () {
            console.log("in reader")
              file_content_array = (reader.result).split("\n")
                          file_content = reader.result
                           $("#import_file #text").remove()
                          $("#import_file").append('<div id="text"/>')
                          for(var texts=0;texts<file_content_array.length;texts++)
                          {
                $("#text").append(file_content_array[texts])
                                $("#text").append("<br />")
                          }
          }
reader.readAsBinaryString(fileInput.files[0]);
}
$(document).on('change', "#fileupload", function (e){
        var fileName = e.target.files[0].name;
        console.log(fileName.split(".")[1])
         if(fileName.split(".")[1] == "yml")
                        readFile()
        else
                        alert("Please upload yml file")

});


$(document).on('click', ".btn-secondary", function ()
  {
         selected_value = $(this).text().trim()
         if(selected_value == "Clone repository")
         {

                $("#git_process").show()
                $("#select_file").hide()
                $("#import_file").hide()
         }
         else if(selected_value == "Import File")
         {
                        $("#git_process").hide()
                $("#select_file").hide()
                $("#import_file").show()
         }
         else
         {
                        $("#git_process").hide()
                $("#select_file").show()
                $("#import_file").hide()
         }

  });
$(document).on("click","#convert", function (){
        to_lookup = $("#to_lookup").prop("checked")
        to_table = $("#to_table").prop("checked")

        if(to_lookup == true)
        {
        toLookup()
        }
        if(to_table == true)
        {
        toTable()
        }
        if(to_lookup == false && to_table == false)
        {
                alert('Please select an option(lookup/table) before convert')
        }

});

function toLookup(){
         lookup_file = prompt("Enter lookup file name", "");
        lookup_file =  "/opt/splunk/etc/apps/sigma-master/lookups/"+lookup_file+".csv"
         console.log("selected_value"+selected_value)

                if(selected_value == "Use existing File/Directory" || selected_value == undefined)
                {
                file_path = $(".file-path").val()
                args = file_path+"|"+ lookup_file
                console.log("args"+args)
                }
                else if(selected_value == "Import File")
                {
                                file_content=file_content.replace(/"/g, "&quot;" )
                                args = "import|"+lookup_file+"|"+file_content
                                console.log(selected_value+" "+args)
                }
                else if(selected_value == "Clone repository")
                {
                        console.log(selected_value)
                    args = "/opt/splunk/etc/apps/sigma-master/gitrepos/"+$(".git_project").val()+"|" + lookup_file
                    console.log("args"+args)
                }
                runCommand(args)


  }

function toTable(){

                if(selected_value == "Use existing File/Directory" || selected_value == undefined)
                {
                file_path = $(".file-path").val()
                args = file_path+"|table"
                console.log("args"+args)
                }
                else if(selected_value == "Import File")
                {
                                file_content=file_content.replace(/"/g, "&quot;" )
                                args = "import|table"+"|"+file_content
                                console.log(selected_value+" "+args)
                }
                else if(selected_value == "Clone repository")
                {

                    args = "/opt/splunk/etc/apps/sigma-master/gitrepos/"+$(".git_project").val()+"|table"
                    console.log("args"+args)
                }
                //runCommand(args)
                tokens.set("form.args", args);


  }

$(document).on("click","#clone", function (){
 $("#content1").addClass("load-icon")
 $(".dashboard-body").addClass("blur")
  came_already = false
  hostname = $(".git_url").val()
                        group = $(".git_grp").val()
                        project = $(".git_project").val()
                        username = $(".git_username").val()
                        pwd = $(".git_pwd").val()
                        clone_arg ="git clone https://"+username+":"+pwd+"@"+hostname+"/"+group+"/"+project+".git"
                        var random =Math.random()
         var searchString = '|gitclone "'+clone_arg+'"'
                 console.log("searchString"+searchString)
         var mySearchManager_clone = new SearchManager({
                 id : "clone_search"+Math.random(),
                 earliest_time : "-2h",
                 latest_time : "now",
                 autostart : true,
                 search : searchString,
                 preview : true,
                 cache : false
             });
                  var myResults = mySearchManager_clone.data("results"); // get the data from that search
         myResults.on("data", function () {
             resultArray = myResults.data().rows;
                         if(came_already == false)
                         {
                         alert(resultArray[0][0])
                          $("#content1").removeClass("load-icon")
                          $(".dashboard-body").removeClass("blur")
                         came_already = true
                         }
         });
 });

  function runCommand(args)
  {
          $("#content1").addClass("load-icon")
                $(".dashboard-body").addClass("blur")
          var random =Math.random()
         var searchString = '|sid "'+args+'"'
                 console.log("searchString"+searchString)
         var mySearchManager = new SearchManager({
                 id : "sigma_search"+Math.random(),
                 earliest_time : "-2h",
                 latest_time : "now",
                 autostart : true,
                 search : searchString,
                 preview : true,
                 cache : false
             });

         var myResults_lookup = mySearchManager.data("results"); // get the data from that search
         myResults_lookup.on("data", function () {
                         console.log("in data another")
             resultArray = myResults_lookup.data().rows;

             alert("Lookup Saved....")
                         $("#content1").removeClass("load-icon")
                         $(".dashboard-body").removeClass("blur")
         });

  }
 });
