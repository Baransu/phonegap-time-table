//==============================================ZMIENNE===================================//
var baseWidth;
var baseHeight;
var fontSize;
var db;
var tempHour;
var tempMinutes;
var slow = ".25s";
var miesiace = ["Styczeñ", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec", "Lipiec", "August", "Wrzesien", "Pazdziernik", "Listopad", "Grudzein"];
var settingsColorsMainPage = ["#8e44ad", "#27ae60", "#c0392b"];
var defaultImg = "img/newyork.jpg";
var ls = localStorage;

var panelDzien = [];
var przedmioty = [];
var nauczyciele = [];
var godziny = [];
var numerSali = [];

var localDni = [
    { krotka: "PON", dluga: "Poniedzialek" },
    { krotka: "WT", dluga: "Wtorek" },
    { krotka: "SR", dluga: "Sroda" },
    { krotka: "CZW", dluga: "Czwartek" },
    { krotka: "PT", dluga: "Piatek" },
    { krotka: "SB", dluga: "Sobota" },
    { krotka: "N", dluga: "Niedziela" },
];

var resetNauczyciele = [
    { imie: "Walter", nazwisko: "White" },
    { imie: "Tomy Lee", nazwisko: "Jones" },
    { imie: "Harison", nazwisko: "Ford" },
];

var resetPrzedmioty = [
    { krotka: "MAT", dluga: "Matematyka" },
    { krotka: "POL", dluga: "Jezyk polski" },
    { krotka: "ANG", dluga: "Jezyk angielski" },
];

var d = new Date();

var rekordyWczytane = false;

$(document).ready(function () {

    document.addEventListener("deviceready", function () {
        //otwieramy tabele
        db = window.openDatabase("planNazwiskoKlasa", "1.0", "nazwa_wyswietlana", 1024 * 1024);
        //db = window.openDatabase("name", "version", "displayname", "size");
        setTimeout(function () {
            alert("ver" + db.version);
        }, 0);

        /*
        //drop table
        db.transaction(drop_table,
           function (tx, error) {
               alert("Error : " + error.message);
           },

           function () {
               setTimeout(function () {
                   alert("drop");
               }, 0);               
           });

        function drop_table(tx) {
            tx.executeSql("DROP TABLE glowna");
            tx.executeSql("DROP TABLE dni");
            tx.executeSql("DROP TABLE godziny");
            tx.executeSql("DROP TABLE przedmioty");
            tx.executeSql("DROP TABLE nauczyciele");
        }
        */
        // tworzenie tabeli
        db.transaction(utworz_tabele, onError, onSuccess);

        //dodanie rekordow to tabeli
        db.transaction(dodaj_rekord, onError, onSuccess);

        //pobierz rekordy
        //db.transaction(pobierzRekordy, onError);

    }, false);

    //Wielkosc aplikacji
    resize();

    //==========================================LOADING STUFF START=========================================//
    if (ls.mainPageImg != null)
        $("#mainPageImg").attr("src", ls.mainPageImg);
    //==========================================LOADING STUFF END=========================================//

    setInterval(function () {        

        if (d.getHours() < 10)
            tempHour = "0" + d.getHours();
        else
            tempHour = d.getHours();

        if (d.getMinutes() < 10)
            tempMinutes = "0" + d.getMinutes();
        else
            tempMinutes = d.getMinutes();

        $("#dateDay").html(localDni[d.getDay() - 1].dluga);
        $("#date").html(d.getDate() + " " + miesiace[d.getMonth()] + " " + d.getFullYear());
        $("#clock").html(tempHour.toString() + ":" + tempMinutes.toString());

    }, 100);

    
    //kolor zegarka
    var abc = 0;
    setInterval(function () {

        $("#settingButtonMainPage").css({ "background-color": settingsColorsMainPage[abc], "transform": "background-color", "transition-duration": "1s" });
        abc++;
        if (abc > 2) abc = 0;       

    }, 60000);
    
    //==========================================POBIERANIE DNI START=========================================//
    function panelDzien(tx) {
        //if (d.getDate() - 1 > 4)
        //    var a = 0;
        //else
        //    var a = d.getDate() - 1;

        tx.executeSql("SELECT przedmioty.nazwaKrotkaPrzedmiotu, przedmioty.nazwaDlugaPrzedmiotu, dni.nazwaDlugaDnia, glowna.numerSali FROM glowna LEFT JOIN przedmioty ON (glowna.kluczObcyPrzedmiotu = przedmioty.idPrzedmiotu) LEFT JOIN dni ON (glowna.kluczObcyDnia = dni.idDnia)WHERE glowna.kluczObcyDnia = 1", [], onSuccessPobierzDzien, onError);

        function onSuccessPobierzDzien(tx, results) {

            var inner = "";
            inner = "";
            for (var a = 0; a < results.rows.length; a++) {
                inner += "<tr class='row'><td class='item1'>" + (a) + "</td><td class='item2'>" + (results.rows.item(a).nazwaKrotkaPrzedmiotu) + " / " + (results.rows.item(a).numerSali) + "</td></tr>";
            }

            //var dayTable = $("#dayTable");
            /*
            for (var a = 0; a < 15; a++) {
                var cos = panelDzien[a].nazwaKrotkaPrzedmiotu;
                //inner += cos;
                inner += "<tr class='row'><td class='item1'>" + a + "</td><td class='item2'>" + cos + "</td></tr>"
                //inner += "<tr class='row'><td class='item1'>" + a + "</td><td class='item2'>NIC</td></tr>"
                //alert(cos)
            }
            */
            $("#dayTable").html(inner);
            $("#dayHeaderText").html(results.rows.item(0).nazwaDlugaDnia)
            alert(results.rows.length)
        };
        //alert(panelDzien[0])
        //tx.executeSql("SELECT numerSali FROM glowna WHERE glowna.kluczObcyDnia = 1", [], function () {
           //for (var b = 0; b < 15; b++)
             //   numerSali[b] = result.rows.item(b);
        //}, onError);

    }
    //==========================================POBIERANIE DNI START=========================================//    
    
    function refreshDay() {

        var dayTable = $("#dayTable");
        var inner = "";
        for (var a = 0; a < 14; a++) {
            //var cos = panelDzien[a].nazwaKrotkaPrzedmiotu;
            //inner += cos;
            //inner += "<tr class='row'><td class='item1'>" + a + "</td><td class='item2'>" + cos + "</td></tr>"
            inner += "<tr class='row'><td class='item1'>" + a + "</td><td class='item2'>NIC / s.</td></tr>"
            //alert(cos)
        }
        dayTable.html(inner);

        
    }

    /*
    var weekTable = $("#weekTable");
    var innerHTML2;
    innerHTML2 += "<tr><td class='itemWeek'>1</td><td class='itemWeek'>2</td><td class='itemWeek'>3</td><td class='itemWeek'>4</td><td class='itemWeek'>5</td><td class='itemWeek'>6</td><td class='itemWeek'>7</td></tr>"
    for (var a = 0; a < 15; a++) {
        innerHTML2 += "<tr><td>" + a + "</td>"
        innerHTML2 += "<td class='itemWeek'>d1</td><td class='itemWeek'>d2</td><td class='itemWeek'>d3</td><td class='itemWeek'>d4</td><td class='itemWeek'>d5</td><td class='itemWeek'>d6</td><td class='itemWeek'>d7</td>"

        innerHTML2 += "</tr>"
    }
    
    weekTable.html(innerHTML);
    */
    var mainPage = $("#mainPage");

    //==========================================SETTINGS START=========================================//
    var settingsPage = $("#settingsPage");
    $("#settingButtonMainPage").tap(function () {
        settingsPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backSettingsPage").tap(function () {
        settingsPage.css( "transform","translateX(-100%)");
        return false;
    });
    settingsPage.on("swipeleft", function () {
        settingsPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================SETTINGS END=========================================//

    //==========================================DAY START=========================================//
    var dayPage = $("#dayPage");
    $("#option1MainPage").tap(function () {        
        dayPage.css("transform", "translateX(0%)");
        db.transaction(panelDzien, onError);
        //refreshDay();
        return false;
    });
    $("#backDayPage").tap(function () {
        dayPage.css("transform", "translateX(-100%)");
        return false;
    });
    dayPage.on("swipeleft", function () {
        dayPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================DAY END=========================================//

    //==========================================WEEK START=========================================//
    var weekPage = $("#weekPage");
    $("#option2MainPage").tap(function () {
        weekPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backWeekPage").tap(function () {
        weekPage.css("transform", "translateX(-100%)");
        return false;
    });
    weekPage.on("swipeleft", function () {
        weekPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================WEEK END=========================================//

    //==========================================HELP START=========================================//
    var helpPage = $("#helpPage");
    $("#option3MainPage").tap(function () {
        //db.transaction(pobierzRekordy, onError);
        helpPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backHelpPage").tap(function () {
        helpPage.css("transform", "translateX(-100%)");
        return false;
    });
    helpPage.on("swipeleft", function () {
        helpPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================HELP END=========================================//

    //==========================================HOURS START=========================================//
    var hoursPage = $("#hoursPage");
    $("#settingPanel1").tap(function () {
        hoursPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backHoursPage").tap(function () {
        hoursPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeHoursPage").tap(function () {
        settingsPage.css("transform", "translateX(-100%)");
        hoursPage.css("transform", "translateX(-100%)");
        return false;
    });
    hoursPage.on("swipeleft", function () {
        hoursPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================HOURS END=========================================//

    //==========================================COLOR START=========================================//
    var colorPage = $("#colorPage");
    $("#settingPanel2").tap(function () {
        colorPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backColorPage").tap(function () {
        colorPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeColorPage").tap(function () {
        settingsPage.css("transform", "translateX(-100%)");
        colorPage.css("transform", "translateX(-100%)");
        return false;
    });
    colorPage.on("swipeleft", function () {
        colorPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================COLOR END=========================================//

    //==========================================STARTUP START=========================================//
    var startupPage = $("#startupPage");
    $("#settingPanel3").tap(function () {
        startupPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backStartupPage").tap(function () {
        startupPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeStartupPage").tap(function () {
        settingsPage.css("transform", "translateX(-100%)");
        startupPage.css("transform", "translateX(-100%)");
        return false;
    });
    startupPage.on("swipeleft", function () {
        startupPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================STARTUP END=========================================//

    //==========================================CAMERA START=========================================//
    var cameraPage = $("#cameraPage");
    $("#settingPanel4").tap(function () {
        cameraPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backCameraPage").tap(function () {
        cameraPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeCameraPage").tap(function () {
        settingsPage.css("transform", "translateX(-100%)");
        cameraPage.css("transform", "translateX(-100%)");
        return false;
    });
    cameraPage.on("swipeleft", function () {
        cameraPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================CAMERA END=========================================//            

    //==========================================IMPEXP START=========================================//
    var impExpPage = $("#impExpPage");
    $("#settingPanel5").tap(function () {
        impExpPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backImpExpPage").tap(function () {
        impExpPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeImpExpPage").tap(function () {
        settingsPage.css("transform", "translateX(-100%)");
        impExpPage.css("transform", "translateX(-100%)");
        return false;
    });
    impExpPage.on("swipeleft", function () {
        impExpPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================IMPEXP END=========================================//

    //==========================================OTHER START=========================================//
    var otherPage = $("#otherPage");
    $("#settingPanel6").tap(function () {
        otherPage.css("transform", "translateX(0%)");
        return false;
    });
    $("#backOtherPage").tap(function () {
        otherPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeOtherPage").tap(function () {
        settingsPage.css({ "transform": "translateX(-100%)" });
        otherPage.css("transform", "translateX(-100%)");
        return false;
    });
    otherPage.on("swipeleft", function () {
        otherPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================OTHER END=========================================//

    //==========================================FILE MANAGER START=========================================//
    var fileManager = $("#fileManagerPage");
    $("#backFileManager").tap(function () {
        fileManager.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeFileManagerPage").tap(function () {
        settingsPage.css("transform", "translate(-100%)");
        impExpPage.css("transform", "translateX(-100%)");
        fileManager.css("transform", "translateX(-100%)");
        return false;
    });
    fileManager.on("swipeleft", function () {
        fileManager.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================FILE MANAGER END=========================================//

    //==========================================FEATURES START=========================================//

    $("#resetPicture").tap(function () {        
        $("#mainPageImg").attr("src", defaultImg);
        ls.mainPageImg = defaultImg;
        setTimeout(function () {
            alert("Zdjecie zresetowane");
        }, 0);
        return false;
    });    
    $("#takePicturePhoto").tap(function () {
        var camOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA // Camera.PictureSourceType.SAVEDPHOTOALBUM   
        };
        navigator.camera.getPicture(camSuccess, camError, camOptions);

        function camSuccess(fileUri) {
            $("#mainPageImg").attr("src", fileUri);
            ls.mainPageImg = fileUri;
            setTimeout(function () {
                alert("Zdjecie zmienione");
            }, 0);
        };
        function camError(error) {
            alert(error.message)
        };
        return false;
    });
    $("#takePictureGallery").tap(function () {
        var camOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY // Camera.PictureSourceType.SAVEDPHOTOALBUM   
        };
        navigator.camera.getPicture(camSuccess, camError, camOptions);

        function camSuccess(fileUri) {
            $("#mainPageImg").attr("src", fileUri);
            ls.mainPageImg = fileUri;
            setTimeout(function () {
                alert("Zdjecie zmienione");
            }, 0);
        };
        function camError(error) {
            alert(error.message)
        };
        return false;
    });
    
    /*
    $("#fileManager").tap(function () {
        
        var rootDir = null;             // katalog g³ówny, startowy
        var currentDir = null;          // bie¿¹cy katalog - wybrany
        var parentDir = null;           // katalog nadrzêdny

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,

                    function (fileSystem) {
                        
                        //mozliwe do uzyskanie dane - sukces
                        console.log(fileSystem.root); // obiekt systemu plików
                        console.log(fileSystem.root.name); // jego nazwa
                        
                        //console.log(fileSystem.root.fullPath); //sciezka w emulatorze
                        
                        console.log(fileSystem.name); // typ
                        console.log(fileSystem.root.isDirectory); //czy katalog
                        console.log(fileSystem.root.isFile); //czy plik

                        //teraz funkcja listuj¹ca zawartoœæ systemu plików:
                        //do niej przekazujemy obiekt fileSystem.root
                        
                    wylistuj_foldery_i_pliki(fileSystem.root);

                    }, function (e) {
                        alert("b³¹d odczytu systemu plików: " + e);
                    });

        function wylistuj_foldery_i_pliki(entry) {
            if (!entry.isDirectory) {
                alert("to nie katalog - nie da siê wylistowaæ");
            } else {
                //tworze readera katalogu - DirectoryReader (patrz dokumentacja)

                var reader = entry.createReader();
                //czytam
                reader.readEntries(readDirSuccess, readDirError);

            }
        };

        function readDirSuccess(entries) {
            
            var dir = "";
            var file = "";
            for (var i = 0; i < entries.length; i++) {
                if(entries[i].isFile)
                    file += "<div class='file'>file: " + entries[i].name + "</div>"
                if(entries[i].isDirectory)
                    dir += "<div class='file'>dir: " + entries[i].name + "</div>"
            }
            $("#mainContentFileManagerPage").html(dir);
            $("#mainContentFileManagerPage").html(file);
            //console.log(entries[i].name); // iloœc -> jeœli 0 to mamy pusty katalog

            //wyczysc zawartoœc div-a w którym poka¿esz katalogi
            //dodaj do niego najpierw katalogi a potem pliki
            //pos³ugujemy sie wy³acznie jquery a nie js - w razie w¹tpliwoœci pytaj jak
        }

        function readDirError(e) {
            alert("b³¹d " + e);
        }

        fileManager.css({ "transform": "translateX(0%)", "transition-duration": slow });
        return false;
    });
    
    */

    //==========================================FEATURES END=========================================//


    //$("#option2").tap(function () {

    /*
    db.transaction(pobierz_dane, onError);

    function pobierz_dane(tx) {
            
        tx.executeSql("SELECT dni.name FROM glowna LEFT JOIN dni ON(glowna.kluczDnia = dni.idDnia)", [], onSuccess, onError)
    };

    function onSuccess(tx, results) {
        alert(results.rows.length)
        alert(results.rows.item(0).name)
        //console.log(results)
    };

    function onError(error) {
        alert("problem z czytaniem: " + error);
    };
    */

    //})

    //==========================================FUNKCJE=========================================//

    function resize() {

        baseWidth = $(window).width();
        baseHeight = $(window).height();

        $(".mainPageButtonBottom").css("width", baseWidth / 3 + "px");

        $(".mainButtonsText").css("font-size", baseHeight / 25 + "px");
        $(".mainButtonsText").css("line-height", baseHeight / 10 + "px");

        $("#clock").css("font-size", baseHeight / 5 + "px")
        $("#clock").css("line-height", baseHeight / 5 + "px")

        $("#date").css("font-size", baseHeight / 25 + "px");
        $("#dateDay").css("font-size", baseHeight * 0.07 + "px");
        $("#dateDay").css("line-height", baseHeight / 10 + "px");

        $(".headerText").css("font-size", baseHeight * 0.04 + "px");
        $(".headerText").css("line-height", baseHeight/10 + "px");

        $(".button").css("font-size", baseHeight * 0.04 + "px");
        $(".button").css("line-height", baseHeight /4 + "px");

        $("#dayTable").css("font-size", baseHeight * 0.07 + "px");

        $(".panels").css("font-size", baseHeight * 0.05 + "px");
        $(".panelsText").css("line-height", baseHeight * 0.15 + "px");

        $("#weekTable").css("font-size", baseHeight * 0.07 + "px");

        $(".itemWeek").css("height", baseHeight / 10 + "px");

        $(".file").css("font-size", baseHeight/5 + "px");
        //$(".file").css("line-height", baseHeight /5 + "px");

    };
    //tworzenie tabeli
    function utworz_tabele(tx) {

        //glowna
        tx.executeSql("CREATE TABLE IF NOT EXISTS glowna (id INTEGER PRIMARY KEY, numerSali VARCHAR(10), kluczObcyDnia INTEGER, kluczObcyGodziny INTEGER, kluczObcyPrzedmiotu INTEGER, kluczObcyNauczyciela INTEGER);");

        //dni
        tx.executeSql("CREATE TABLE IF NOT EXISTS dni (idDnia INTEGER PRIMARY KEY, nazwaKrotkaDnia VARCHAR(10), nazwaDlugaDnia VARCHAR(25));");

        //godziny
        tx.executeSql("CREATE TABLE IF NOT EXISTS godziny (idGodziny INTEGER PRIMARY KEY, godzinaOd VARCHAR(10), minutaOd VARCHAR(10), godzinaDo VARCHAR(10), minutaDo VARCHAR(10));");

        //przedmioty
        tx.executeSql("CREATE TABLE IF NOT EXISTS przedmioty (idPrzedmiotu INTEGER PRIMARY KEY, nazwaKrotkaPrzedmiotu VARCHAR(30), nazwaDlugaPrzedmiotu VARCHAR(30));");

        //nauczyciele
        tx.executeSql("CREATE TABLE IF NOT EXISTS nauczyciele (idNauczyciela INTEGER PRIMARY KEY, imieNauczyciela VARCHAR(30), nazwiskoNauczyciela VARCHAR(30));");


    };
    //dodawanie rekordow
    function dodaj_rekord(tx) {
        var mainTemp = 0;
        //glowna
        for (var a = 1; a <= 5; a++) {
            for (var b = 1; b <= 14; b++) {
                mainTemp++;
                tx.executeSql("INSERT INTO glowna (id, numerSali, kluczObcyDnia, kluczObcyGodziny, kluczObcyPrzedmiotu, kluczObcyNauczyciela) VALUES (" + mainTemp + ", 0, " + a + ", " + b + ", 1, 1);");
            }
        }
                
        //dni
        for (var a = 1; a <= localDni.length; a++) {
            tx.executeSql("INSERT INTO dni (idDnia, nazwaKrotkaDnia, nazwaDlugaDnia) VALUES (" + a + ", '" + localDni[a - 1].krotka + "', '" + localDni[a - 1].dluga + "');");
        }

        //godziny
        for (var a = 1; a <= 14; a++) {
            tx.executeSql("INSERT INTO godziny (idGodziny, godzinaOd, minutaOd, godzinaDo, minutaDo) VALUES (" + a + ", 0, 0, 0, 0);");
        }

        //przedmioty   
        for (var a = 1; a <= resetNauczyciele.length; a++) {
            tx.executeSql("INSERT INTO przedmioty (idPrzedmiotu, nazwaKrotkaPrzedmiotu, nazwaDlugaPrzedmiotu) VALUES (" + a + ", '" + resetPrzedmioty[a - 1].krotka + "','" + resetPrzedmioty[a - 1].dluga + "');");
        }

        //nauczyciele
        for (var a = 1; a <= resetPrzedmioty.length; a++) {
            tx.executeSql("INSERT INTO nauczyciele (idNauczyciela, imieNauczyciela, nazwiskoNauczyciela) VALUES (" + a + ", '" + resetNauczyciele[a - 1].imie + "','" + resetNauczyciele[a - 1].nazwisko + "');");
        }
    };
    function onSuccess() {
        setTimeout(function () {
            alert("Success");
        }, 0);

    };
    function onError(tx, error) {
        setTimeout(function () {
            alert("Error przy wstawianiu rekordu: " + error.message);
        }, 0);
    };

    /*
    //wyczyszczenie bazy (dla bezpieczenstwa)
    db.transaction(usun_rekord,
        function (tx, error) {
            alert("Error przy usuwaniu rekordu: " + error);
        },
        function () {
            alert("rekordy usuniete");

        });

    function usun_rekord(tx) {

        //tx.executeSql("DELETE FROM glowna");
        //tx.executeSql("DELETE FROM dni");

    }
    */
});
