//==============================================TO DO===================================//
//dodanie/usuniecie przedmiotow
//dodanie/usuniecie nauczycieli
//file manager
//backup lokalny
//import z pliku
//backup na serwer
//import z serwera
//wyswietlenie nastepnej lekcji na stronie startowej

//kolorystyka (opcionalnie)
//==============================================TO DO===================================//

//==============================================ZMIENNE===================================//
var baseWidth;
var baseHeight;
var fontSize;
var db;
var tempHour;
var tempMinutes;
var ls = localStorage;

//kolory przycisku ustawien na stronie startowej
var settingsColorsMainPage = ["#8e44ad", "#27ae60", "#c0392b"];

//domyslny obrazek w tle na stronie startowej
var defaultImg = "img/newyork.jpg";

//miesiace do wyswietlania na stronie startowej
var miesiace = [
    "Styczeñ",
    "Luty",
    "Marzec",
    "Kwiecien",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "August",
    "Wrzesien",
    "Pazdziernik",
    "Listopad",
    "Grudzein"
];

//dni do wyswietlania na stronie startowej
var infoDni = [
    { krotka: "N", dluga: "Niedziela" },
    { krotka: "PON", dluga: "Poniedzialek" },
    { krotka: "WT", dluga: "Wtorek" },
    { krotka: "SR", dluga: "Sroda" },
    { krotka: "CZW", dluga: "Czwartek" },
    { krotka: "PT", dluga: "Piatek" },
    { krotka: "SB", dluga: "Sobota" },    
];

//dni do wgrania do bazy danych przy tworzeniu jej pierwszy raz
var localDni = [
    { krotka: "PON", dluga: "poniedzialek" },
    { krotka: "WT", dluga: "wtorek" },
    { krotka: "SR", dluga: "sroda" },
    { krotka: "CZW", dluga: "czwartek" },
    { krotka: "PT", dluga: "piatek" },
    { krotka: "SB", dluga: "sobota" },
    { krotka: "N", dluga: "niedziela" },
];

//nauczyciele do wgrania przy tworzeniu bazy danych
var resetNauczyciele = [
    { imie: "--", nazwisko: "--" },
    { imie: "Walter", nazwisko: "White" },
    { imie: "Tomy Lee", nazwisko: "Jones" },
    { imie: "Harison", nazwisko: "Ford" },
];

//przedmioty do wgrania przy tworzeniu bazy danych
var resetPrzedmioty = [
    { krotka: "--", dluga: "--" },
    { krotka: "MAT", dluga: "Matematyka" },
    { krotka: "POL", dluga: "Jezyk polski" },
    { krotka: "ANG", dluga: "Jezyk angielski" },
];

//godziny do wgranie przy tworzeniu bazy danych
var resetGodziny = [
    { gOd: 6, mOd: 00, gOd: 6, gDo: 45},
    { gOd: 6, mOd: 45, gOd: 7, gDo: 30},
    { gOd: 7, mOd: 30, gOd: 8, gDo: 15},
    { gOd: 8, mOd: 15, gOd: 9, gDo: 00 },
    { gOd: 9, mOd: 00, gOd: 9, gDo: 45 },
    { gOd: 9, mOd: 45, gOd: 10, gDo: 30 },
    { gOd: 10, mOd: 30, gOd: 11, gDo: 15 },
    { gOd: 11, mOd: 15, gOd: 12, gDo: 00 },
    { gOd: 12, mOd: 00, gOd: 12, gDo: 45 },
    { gOd: 12, mOd: 45, gOd: 13, gDo: 30 },
    { gOd: 13, mOd: 30, gOd: 14, gDo: 15 },
    { gOd: 14, mOd: 15, gOd: 15, gDo: 00 },
    { gOd: 15, mOd: 00, gOd: 15, gDo: 45 },
    { gOd: 15, mOd: 45, gOd: 16, gDo: 30 },
];

//aktualny dzien
var curDay = 1;
//aktualna godzina do edycji
var curHour;

//index godziny ktora edytujemy
var hourEditIndex;

//czy edytujemy godzine rozpoczecia czy zakonczenia (Od rozpoczecia, Do zakonczenia)
var hourOption = "";

//aktualny dzien do edycji w panelu tydzien lub dzien
var curEditDay = 1;

//czy nasza strona TS pokazuje T czy S
var showTS = "";

//data
var d = new Date();

//nazwa do edycji przedmiotu
var nazwaEdytowanegoTS;

//praktycznie wczytano wszystko
var initialized = false;
//==============================================ZMIENNE===================================//

$(document).ready(function () {

    document.addEventListener("deviceready", function () {
        //wczytanie bazy danych
        db = window.openDatabase("planNazwiskoKlasa", "1.0", "nazwa_wyswietlana", 1024 * 1024);

        //wypisanie wersji bazy danych
        setTimeout(function () {
            alert("ver" + db.version);
        }, 0);

        //stworzenie potrzebnych tabeli
        db.transaction(utworz_tabele, onError, onSuccess);

        //zapelnienie tabeli podstawowymi danymi
        db.transaction(dodaj_rekord, onError, onSuccess);

    }, false);

    //dopasowywanie css do wielkosci ekranu
    stylo();

    //==========================================ZARZADZANIE PANELEM STARTOWYM=========================================//
    //wczytanie zdjecia z localStorage
    if (ls.mainPageImg != null)
        $("#mainPageImg").attr("src", ls.mainPageImg);

    //ustawienie zagarka
    setInterval(function () {        
        
        if (d.getHours() < 10)
            tempHour = "0" + d.getHours();
        else
            tempHour = d.getHours();

        if (d.getMinutes() < 10)
            tempMinutes = "0" + d.getMinutes();
        else
            tempMinutes = d.getMinutes();

        $("#dateDay").html(infoDni[d.getDay()].dluga);
        $("#date").html(d.getDate() + " " + miesiace[d.getMonth()] + " " + d.getFullYear());
        $("#clock").html(tempHour.toString() + ":" + tempMinutes.toString());

        

    }, 100);

    
    //kolor przycisku odpowiedzialnego za strone z ustawieniami
    var kolor = 0;
    setInterval(function () {

        $("#settingButtonMainPage").css({ "background-color": settingsColorsMainPage[kolor], "transform": "background-color", "transition-duration": "1s" });
        kolor++;
        if (kolor > 2) abc = 0;

        getCurDay();

    }, 60000);
    //==========================================ZARZADZANIE PANELEM STARTOWYM=========================================//
    
    //ustawianie dzisiejszego dnia
    function getCurDay() {
        if (d.getDay() <= 5)
            curDay = d.getDay();
        if (d.getDay() > 5)
            curDay == 0;
        if (d.getDay() == 0)
            curDay = 5;
    }
    getCurDay();

    setTimeout(function () {
        initialized = true;
    }, 500)
 
    /*############################################################################################
                    ZARZ¥DZANIE WYSUWANYMI PANELAMI... WYSUNIECIE/SCHOWANIE/SWIPELEFT
    ##############################################################################################*/

    //==========================================SETTINGS=========================================//
    //wysuniecie strony
    var settingsPage = $("#settingsPage");
    $("#settingButtonMainPage").tap(function () {
        settingsPage.css("transform", "translateX(0%)");
        return false;
    });
    //schowanie strony
    $("#backSettingsPage").tap(function () {
        settingsPage.css( "transform","translateX(-100%)");
        return false;
    });
    //schowanie strony on swipeleft
    settingsPage.on("swipeleft", function () {
        settingsPage.css("transform", "translateX(-100%)");
        return false;
    });
    //==========================================SETTINGS=========================================//

    //==========================================DAY=========================================//
    var dayPage = $("#dayPage");
    $("#option1MainPage").tap(function () {        
        dayPage.css("transform", "translateX(0%)");
        db.transaction(pobierzDzien, onError);
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
    //==========================================DAY=========================================//

    //==========================================WEEK=========================================//
    var weekPage = $("#weekPage");
    $("#option2MainPage").tap(function () {
        weekPage.css("transform", "translateX(0%)");
        db.transaction(pobierzTydzien, onError);
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
    //==========================================WEEK=========================================//

    //==========================================HELP=========================================//
    var helpPage = $("#helpPage");
    $("#option3MainPage").tap(function () {
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
    //==========================================HELP=========================================//

    //==========================================HOURS=========================================//
    var hoursPage = $("#hoursPage");
    $("#settingPanel1").tap(function () {
        hoursPage.css("transform", "translateX(0%)");
        db.transaction(pobierzGodziny, onError);
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
    var updateHoursPage = $("#updateHoursPage")
    $("#hoursTable").on("tap", ".hourBegin", function () {
        updateHoursPage.css("transform", "translateX(0%)");
        hourEditIndex = $(this).parent().index() + 1;
        hourOption = "Od";
        return false;
    });
    $("#hoursTable").on("tap", ".hourEnd", function () {
        updateHoursPage.css("transform", "translateX(0%)");
        hourEditIndex = $(this).parent().index() + 1;
        hourOption = "Do";
        return false;
    });
    //aktualizowanie godziny
    $("#updatePageSelectButtonHoursConfirm").on("tap", function () {
        if (confirm("Czy chcesz zmienic dane godziny?")) {
            updateHoursPage.css("transform", "translateX(-100%)");
            db.transaction(updateHours, onError);
            function updateHours(tx) {
                tx.executeSql("UPDATE godziny SET godzina" + hourOption + "=" + $('#selectGodzina').val().toString() + ", minuta" + hourOption + "=" + $("#selectMinuty").val().toString() + " WHERE idGodziny='" + hourEditIndex + "';");
            }
            db.transaction(pobierzGodziny, onError);
        }
        return false;
    });
    $("#updatePageSelectButtonHoursDecline").on("tap", function () {
        updateHoursPage.css("transform", "translateX(-100%)");
        return false;
    });
    //resetowanie godziny
    $("#updatePageDeleteHour").on("tap", function () {
        if (confirm("Czy chcesz usunac edytowana godzine?")) {
            updateHoursPage.css("transform", "translateX(-100%)");
            db.transaction(updateDeleteHour, onError);
            function updateDeleteHour(tx) {
                tx.executeSql("UPDATE godziny SET godzinaOd = '--', minutaOd = '--', godzinaDo = '--', minutaDo = '--' WHERE idGodziny='" + hourEditIndex + "';");
            }
            db.transaction(pobierzGodziny, onError);
        }
        return false;
    });
    //==========================================HOURS=========================================//

    //==========================================COLOR=========================================//
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
    //==========================================COLOR=========================================//

    //==========================================STARTUP=========================================//
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
    //==========================================STARTUP=========================================//

    //==========================================CAMERA=========================================//
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
    //==========================================CAMERA=========================================//            

    //==========================================IMPORT/EXPORT=========================================//
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
    //==========================================IMPORT/EXPORT=========================================//

    //==========================================OTHER=========================================//
    var otherPage = $("#otherPage");
    var showTSPage = $("#showTSPage")
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
    showTSPage.on("swipeleft", function () {
        showTSPage.css("transform", "translateX(-100%)");
        return false;
    });
    //wlacz strone do przegladania nauczycieli
    $("#showT").tap(function () {
        showTSPage.css("transform", "translateX(0%)");
        showTS = "T";
        db.transaction(wczytajNauczycieli, onError);
        return false;
    });
    //wlacz stronie do przegladania przedmiotow
    $("#showS").tap(function () {
        showTSPage.css("transform", "translateX(0%)");
        showTS = "S";
        db.transaction(wczytajPrzedmioty, onError);
        return false;
    });

    $("#backShowTSPage").tap(function () {
        showTSPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeShowTSPage").tap(function () {
        settingsPage.css({ "transform": "translateX(-100%)" });
        otherPage.css("transform", "translateX(-100%)");
        showTSPage.css("transform", "translateX(-100%)");
        return false;
    });
    //strona od edycji nauczyciela
    var updateTPage = $("#updateTPage");
    //strona od edycji przedmiotu
    var updateSPage = $("#updateSPage");
    $("#showTSDiv").on("tap", ".showTSItem", function () {        
        nazwaEdytowanegoTS = $(this).text();
        //przedmioty
        if (showTS == "S") {
            $("#updateSPage").css("transform", "translateX(0%)");
        }
        if (showTS == "T") {
            $("#updateTPage").css("transform", "translateX(0%)");
        }       
    });
    $("#updateTDecline").tap(function () {
        updateTPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#updateSDecline").tap(function () {
        updateSPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#updateTConfirm").tap(function () {
        if (confirm("Czy chcesz zatwierdzic edycje nauczyciela?")) {
            updateTPage.css("transform", "translateX(-100%)");
            db.transaction(aktualizujNauczyciela, onError);            
            //aktualizacja danych edytowanego nauczyciela
            function aktualizujNauczyciela(tx) {
                tx.executeSql("UPDATE nauczyciele SET imieNauczyciela = '" + $("#firstName").val() + "', nazwiskoNauczyciela = '" + $("#secondName").val() + "' WHERE nazwiskoNauczyciela='" + nazwaEdytowanegoTS + "';");
            }
            db.transaction(wczytajNauczycieli, onError);
        }
    });
    $("#updateSConfirm").tap(function () {
        if(confirm("Czy chcesz zatwierdzic edycja przedmiotu?")){
            updateSPage.css("transform", "translateX(-100%)");
            db.transaction(aktualizujPrzedmiot, onError);
            //aktualizacja danych edytowanego przedmiotu
            function aktualizujPrzedmiot(tx) {
                tx.executeSql("UPDATE przedmioty SET nazwaKrotkaPrzedmiotu = '" + $("#subjectShort").val() + "', nazwaDlugaPrzedmiotu = '" + $("#subjectLong").val() + "' WHERE nazwaDlugaPrzedmiotu='" + nazwaEdytowanegoTS + "';");
            }
            db.transaction(wczytajPrzedmioty, onError);
        }
    });
    $("#updateSDelete").tap(function () {
        if (confirm("Czy na pewno chcesz usunac ten przedmiot?")) {
            updateSPage.css("transform", "translateX(-100%)");

            db.transaction(getIDPrzedmiotu, onError);
            var idPrzedmiotu;
            function getIDPrzedmiotu(tx) {
                tx.executeSql("SELECT idPrzedmiotu FROM przedmioty WHERE nazwaDlugaPrzedmiotu = '" + nazwaEdytowanegoTS + "';", [],
                function (tx, results) {
                    idPrzedmiotu = results.rows.item(0).idPrzedmiotu
                }, onError);
            };

            db.transaction(naprawGlownaPrzedmiot, onError);
            function naprawGlownaPrzedmiot(tx) {
                tx.executeSql("UPDATE glowna SET kluczObcyPrzedmiotu = 0 WHERE kluczObcyPrzedmiotu=" + idPrzedmiotu + ";");
            }
            db.transaction(usunPrzedmiot, onError);
            //aktualizacja danych edytowanego przedmiotu
            function usunPrzedmiot(tx) {
                tx.executeSql("UPDATE przedmioty SET nazwaKrotkaPrzedmiotu = '--', nazwaDlugaPrzedmiotu = '--' WHERE nazwaDlugaPrzedmiotu='" + nazwaEdytowanegoTS + "';");
            }            
            db.transaction(wczytajPrzedmioty, onError);
        }
    });
    $("#updateTDelete").tap(function () {
        if (confirm("Czy na pewno chcesz usunac tego nauczyciela?")) {
            updateTPage.css("transform", "translateX(-100%)");
            db.transaction(getIDNauczyciela, onError);
            var idNauczyciela;
            function getIDNauczyciela(tx) {
                tx.executeSql("SELECT idNauczyciela FROM nauczyciele WHERE nazwiskoNauczyciela = '"+nazwaEdytowanegoTS+"';", [],
                function (tx, results) {
                    idNauczyciela = results.rows.item(0).idNauczyciela
                }, onError);
            };

            db.transaction(naprawGlownaNauczyciel, onError);
            function naprawGlownaNauczyciel(tx) {
                tx.executeSql("UPDATE glowna SET kluczObcyNauczyciela = 0 WHERE kluczObcyNauczyciela=" + idNauczyciela + ";");
            }
            db.transaction(usunNauczyciela, onError);
            //aktualizacja danych edytowanego przedmiotu
            function usunNauczyciela(tx) {
                tx.executeSql("UPDATE nauczyciele SET imieNauczyciela = '--', nazwiskoNauczyciela = '--' WHERE nazwiskoNauczyciela='" + nazwaEdytowanegoTS + "';");
            }
            db.transaction(wczytajNauczycieli, onError);
        }
    });
    //dodaj
    $("#addTS").tap(function () {
        //nowy przedmiot
        if (showTS == "S") {
            var lastPrzedmiot;
            db.transaction(getLastPrzedmot, onError);
            function getLastPrzedmot(tx) {
                tx.executeSql("SELECT idPrzedmiotu FROM przedmioty;", [],
                function (tx, results) {
                    lastPrzedmiot = results.rows.length;
                }, onError);
            };
            db.transaction(addPrzedmiot, onError);
            function addPrzedmiot(tx) {
                tx.executeSql("INSERT INTO przedmioty (idPrzedmiotu, nazwaKrotkaPrzedmiotu, nazwaDlugaPrzedmiotu) VALUES (" + lastPrzedmiot + ", 'ABC', 'przedmiot" + lastPrzedmiot + "');");
            };
            db.transaction(wczytajPrzedmioty, onError);
        }
        //nauczyciela
        if (showTS == "T") {
            var lastNauczyciel;
            db.transaction(getLastNauczyciel, onError);
            function getLastNauczyciel(tx) {
                tx.executeSql("SELECT idNauczyciela FROM nauczyciele;", [],
                function (tx, results) {
                    lastNauczyciel = results.rows.length;
                }, onError);
            };
            db.transaction(addNauczyciela, onError);
            function addNauczyciela(tx) {
                tx.executeSql("INSERT INTO nauczyciele (idNauczyciela, imieNauczyciela, nazwiskoNauczyciela) VALUES (" + lastNauczyciel + ", 'Jan', 'Kowalki" + lastNauczyciel + "');");
            };
            db.transaction(wczytajNauczycieli, onError);
        }
    });
    //pobranie przedmiotow do edycji przedmiotow
    function wczytajPrzedmioty(tx) {
        tx.executeSql("SELECT przedmioty.idPrzedmiotu, przedmioty.nazwaDlugaPrzedmiotu FROM przedmioty WHERE przedmioty.idPrzedmiotu > 0 AND przedmioty.nazwaKrotkaPrzedmiotu != '--';", [],
        function (tx, results) {
            var inner = "";
            for (var a = 0; a < results.rows.length; a++) {
                inner += "<div class='showTSItem'>" + (results.rows.item(a).nazwaDlugaPrzedmiotu) + "</div>";
            }
            $("#showTSDiv").html(inner);
        }, onError);
    };
    //pobranie nauczycieli do edycji nauczycieli
    function wczytajNauczycieli(tx) {
        tx.executeSql("SELECT nauczyciele.idNauczyciela, nauczyciele.imieNauczyciela, nauczyciele.nazwiskoNauczyciela FROM nauczyciele WHERE nauczyciele.idNauczyciela > 0 AND nauczyciele.imieNauczyciela != '--';", [],
        function (tx, results) {
            var inner = "";

            for (var a = 0; a < results.rows.length; a++) {
                inner += "<div class='showTSItem'>" + (results.rows.item(a).nazwiskoNauczyciela) + "</div>";
            }
            $("#showTSDiv").html(inner);
        }, onError);
    };
    //==========================================OTHER=========================================//

    //==========================================FILE MANAGER=========================================//
    var fileManager = $("#fileManagerPage");
    $("#backFileManagerPage").tap(function () {
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
    //==========================================FILE MANAGER=========================================//

    //==========================================UPDATE LESSON=========================================//
    var updateLessonPage = $("#updateLessonPage");    
    $("#dayTable").on("tap", ".dayItemContent", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index() + 1;
        curEditDay = curDay;
        return false;
    });
    $("#backUpdateLessonPage").tap(function () {
        updateLessonPage.css("transform", "translateX(-100%)");
        return false;
    });
    $("#headerHomeUpdateLessonPage").tap(function () {
        dayPage.css({ "transform": "translateX(-100%)" });
        updateLessonPage.css("transform", "translateX(-100%)");
        return false;
    });
    //aktualizowanie lekcji
    $("#updatePageSelectButtonsConfirm").tap(function () {
        if (confirm("Czy chcesz zmienic dane lekcji?")) {
            updateLessonPage.css("transform", "translateX(-100%)");

            db.transaction(updateLesson, onError);

            function updateLesson(tx) {
                tx.executeSql("UPDATE glowna SET numerSali = '" + $("#sala").val() + "', kluczObcyPrzedmiotu = " + parseInt($("#selectPrzedmioty").val()) + ", kluczObcyNauczyciela = " + parseInt($("#selectNauczyciele").val()) + " WHERE kluczObcyDnia = " + curEditDay + " AND kluczObcyGodziny = " + curHour + ";");
            }
            db.transaction(pobierzDzien, onError);
            db.transaction(pobierzTydzien, onError);
            getCurDay();
        }
        return false;
    });
    $("#updatePageSelectButtonsDecline").tap(function () {
        updateLessonPage.css("transform", "translateX(-100%)");
        return false;
    });
    //usuwanie lekcji do wartosci domyslnej
    $("#updatePageDeleteLesson").tap(function () {

        if (confirm("Czy chcesz usunac dana lekcje?")) {
            updateLessonPage.css("transform", "translateX(-100%)");


            db.transaction(resetCurLesson, onError);

            function resetCurLesson(tx) {
                tx.executeSql("UPDATE glowna SET numerSali = '--', kluczObcyPrzedmiotu = 0, kluczObcyNauczyciela = 0 WHERE kluczObcyDnia = " + curDay + " AND kluczObcyGodziny = " + curHour + ";");
            }
            db.transaction(pobierzDzien, onError);
            db.transaction(pobierzTydzien, onError);
        }
        return false;
    });
    //wlaczanie edycji lekcji w panelu tygodnia
    $("#weekTable").on("tap", ".week1", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index();
        curEditDay = 1;
        return false;
    });
    $("#weekTable").on("tap", ".week2", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index();
        curEditDay = 2;
        return false;
    });
    $("#weekTable").on("tap", ".week3", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index();
        curEditDay = 3;
        return false;
    });
    $("#weekTable").on("tap", ".week4", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index();
        curEditDay = 4;
        return false;
    });
    $("#weekTable").on("tap", ".week5", function () {
        updateLessonPage.css("transform", "translateX(0%)");
        db.transaction(pobierzPrzedmioty, onError);
        db.transaction(pobierzNauczycieli, onError);
        curHour = $(this).parent().index();
        curEditDay = 5;
        return false;
    });
    //==========================================UPDATE LESSON=========================================//

    //==========================================USTAWIANIE ZDJECIA NA EKRANIE STARTOWYM=========================================//
    //resetowanie zdjecia do zdjecia domyslnego
    $("#resetPicture").tap(function () {
        $("#mainPageImg").attr("src", defaultImg);
        ls.mainPageImg = defaultImg;
        setTimeout(function () {
            alert("Zdjecie zresetowane!");
        }, 0);
        return false;
    });
    //ustawianie zdjecia z kamery
    $("#takePicturePhoto").tap(function () {
        var camOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA  
        };
        navigator.camera.getPicture(camSuccess, camError, camOptions);
        return false;
    });
    //ustawianie zdjecia z galerii
    $("#takePictureGallery").tap(function () {
        var camOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY 
        };
        navigator.camera.getPicture(camSuccess, camError, camOptions);       
        return false;
    });
    //udane pobranie zdjecia
    function camSuccess(fileUri) {
        $("#mainPageImg").attr("src", fileUri);
        ls.mainPageImg = fileUri;
        setTimeout(function () {
            alert("Zdjecie zmienione!");
        }, 0);
    };
    //blad przy pobieraniu zdjecia
    function camError(error) {
        alert("Blad kamery: " + error.message)
    };
    //==========================================USTAWIANIE ZDJECIA NA EKRANIE STARTOWYM=========================================//

    /*############################################################################################
                                          WSZYSTKIE FUNKCJE
    ##############################################################################################*/

    //pobranie lekcji z calego tygodnia WIP
    function pobierzTydzien(tx) {
        tx.executeSql("SELECT przedmioty.nazwaKrotkaPrzedmiotu, przedmioty.nazwaDlugaPrzedmiotu, glowna.numerSali FROM glowna LEFT JOIN przedmioty ON (glowna.kluczObcyPrzedmiotu = przedmioty.idPrzedmiotu)", [],
        function (tx, results) {
            var inner = "";
            //info header (dzien tygodnia)
            inner += "<tr><td class='weekId weekIdItemHeader'></td>"
            inner += "<td class='weekItemHeader weekIdItemHeader'>PON</td>"
            inner += "<td class='weekItemHeader weekIdItemHeader'>WT</td>"
            inner += "<td class='weekItemHeader weekIdItemHeader'>SR</td>"
            inner += "<td class='weekItemHeader weekIdItemHeader'>CZW</td>"
            inner += "<td class='weekItemHeader weekIdItemHeader'>PT</td>"
            inner += "</tr>"

            for (var a = 0; a < 14; a++) {
                    
                    inner += "<tr><td class='weekId'>" + (a + 1) + "</td>"
                    inner += "<td class='week1 weekItem weekLight'>" + (results.rows.item(a).nazwaKrotkaPrzedmiotu) + "</br>s." + (results.rows.item(a).numerSali) + "</td>"
                    inner += "<td class='week2 weekItem weekDark'>" + (results.rows.item(a + 14).nazwaKrotkaPrzedmiotu) + "</br>s." + (results.rows.item(a + 14).numerSali) + "</td>"
                    inner += "<td class='week3 weekItem weekLight'>" + (results.rows.item(a + 28).nazwaKrotkaPrzedmiotu) + "</br>s." + (results.rows.item(a + 28).numerSali) + "</td>"
                    inner += "<td class='week4 weekItem weekDark'>" + (results.rows.item(a + 42).nazwaKrotkaPrzedmiotu) + "</br>s." + (results.rows.item(a + 42).numerSali) + "</td>"
                    inner += "<td class='week5 weekItem weekLight'>" + (results.rows.item(a + 56).nazwaKrotkaPrzedmiotu) + "</br>s." + (results.rows.item(a + 56).numerSali) + "</td>"
                    inner += "</tr>"

            }
            $("#weekTable").html(inner);
        }, onError);
    };
    //panel godziny
    function pobierzGodziny(tx) {
        tx.executeSql("SELECT * FROM godziny;", [],
        function (tx, results) {
            var inner = "";
            for (var a = 0; a < results.rows.length; a++) {                
                inner += ("<tr class='hourRow'><td class='hourIndex'>" + (results.rows.item(a).idGodziny) + "</td><td class='hourBegin'>" + results.rows.item(a).godzinaOd + ":" + (results.rows.item(a).minutaOd) + "</td><td class='hourEnd'>" + results.rows.item(a).godzinaDo + ":" + (results.rows.item(a).minutaDo) + "</td></tr>");
            }
            $("#hoursTable").html(inner);
        }, onError);
    };
    //pobranie przedmiotow do edycji lekcji
    function pobierzPrzedmioty(tx) {
        tx.executeSql("SELECT przedmioty.idPrzedmiotu, przedmioty.nazwaDlugaPrzedmiotu FROM przedmioty WHERE przedmioty.idPrzedmiotu > 0 AND przedmioty.nazwaKrotkaPrzedmiotu != '--';", [],
        function (tx, results) {
            var options = "";
            for (var a = 0; a < results.rows.length; a++) {
                options += "<option value='" + results.rows.item(a).idPrzedmiotu + "'>" + results.rows.item(a).nazwaDlugaPrzedmiotu + "</option>";
            }
            $("#selectPrzedmioty").html(options);
        }, onError);
    };
    //pobranie nauczycieli do edycji lekcji
    function pobierzNauczycieli(tx) {
        tx.executeSql("SELECT nauczyciele.idNauczyciela, nauczyciele.imieNauczyciela, nauczyciele.nazwiskoNauczyciela FROM nauczyciele WHERE nauczyciele.idNauczyciela > 0 AND nauczyciele.imieNauczyciela != '--';", [],
        function (tx, results) {
            var options = "";
            for (var a = 0; a < results.rows.length; a++) {
                options += "<option value='" + results.rows.item(a).idNauczyciela + "'>" + results.rows.item(a).imieNauczyciela + " " + results.rows.item(a).nazwiskoNauczyciela + "</option>";
            }
            $("#selectNauczyciele").html(options);
        }, onError);
    };
    //pobranie lekcji na aktualny dzien
    function pobierzDzien(tx) {
        tx.executeSql("SELECT przedmioty.nazwaKrotkaPrzedmiotu, przedmioty.nazwaDlugaPrzedmiotu, dni.nazwaDlugaDnia, glowna.numerSali, glowna.kluczObcyDnia FROM glowna LEFT JOIN przedmioty ON (glowna.kluczObcyPrzedmiotu = przedmioty.idPrzedmiotu) LEFT JOIN dni ON (glowna.kluczObcyDnia = dni.idDnia) WHERE glowna.kluczObcyDnia = " + curDay + "", [],
        function (tx, results) {
            var inner = "";
            for (var a = 0; a < results.rows.length; a++) {
                inner += "<tr class='row'><td class='dayItemId'>" + (a + 1) + "</td><td class='dayItemContent'>" + (results.rows.item(a).nazwaKrotkaPrzedmiotu) + " / s." + (results.rows.item(a).numerSali) + "</td></tr>";
            }
            $("#dayTable").html(inner);
            $("#dayHeaderText").html(results.rows.item(0).nazwaDlugaDnia)
        }, onError);
    };

    /*
    //file manager WIP
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
    
    //ustawianie css w zaleznosci od wielkosc
    function stylo() {
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

        $("#dayTable").css("font-size", baseHeight * 0.06 + "px");
        $("#hoursTable").css("font-size", baseHeight * 0.06 + "px");

        $(".select").css("font-size", baseHeight * 0.04 + "px");

        $(".panels").css("font-size", baseHeight * 0.05 + "px");
        $(".panelsText").css("line-height", baseHeight * 0.15 + "px");

        $("#weekTable").css("font-size", baseHeight * 0.05 + "px");

        $(".file").css("font-size", baseHeight/5 + "px");

        $(".updatePageSelectButton").css("width", (baseWidth / 2) - 1 + "px")

        $(".updatePageSelectButton").css("font-size", baseHeight / 20 + "px");
        $(".updatePageSelectButton").css("line-height", baseHeight / 15 + "px");

        $(".updateDeleteButton").css("font-size", baseHeight / 20 + "px");
        $(".updateDeleteButton").css("line-height", baseHeight / 15 + "px");

        $("#showTSDiv").css("font-size", baseHeight * 0.06 + "px")
        $("#showTSDiv").css("line-height", baseHeight * 0.06 + "px");

        $("#addTS").css("font-size", baseHeight / 20 + "px");
        $("#addTS").css("line-height", baseHeight / 15 + "px");

    };
    //==========================================FUNKCJE=========================================//

    //==========================================TWORZENIE I WYPELNIANIE BAZY DANYCH=========================================//
    //tworzenie tabeli
    function utworz_tabele(tx) {
        //tabela glowna
        tx.executeSql("CREATE TABLE IF NOT EXISTS glowna (id INTEGER PRIMARY KEY, numerSali VARCHAR(10), kluczObcyDnia INTEGER, kluczObcyGodziny INTEGER, kluczObcyPrzedmiotu INTEGER, kluczObcyNauczyciela INTEGER);");
        //tabela dni
        tx.executeSql("CREATE TABLE IF NOT EXISTS dni (idDnia INTEGER PRIMARY KEY, nazwaKrotkaDnia VARCHAR(10), nazwaDlugaDnia VARCHAR(25));");
        //tabela godziny
        tx.executeSql("CREATE TABLE IF NOT EXISTS godziny (idGodziny INTEGER PRIMARY KEY, godzinaOd VARCHAR(10), minutaOd VARCHAR(10), godzinaDo VARCHAR(10), minutaDo VARCHAR(10));");
        //tabela przedmioty
        tx.executeSql("CREATE TABLE IF NOT EXISTS przedmioty (idPrzedmiotu INTEGER PRIMARY KEY, nazwaKrotkaPrzedmiotu VARCHAR(30), nazwaDlugaPrzedmiotu VARCHAR(30));");
        //tabela nauczycieled
        tx.executeSql("CREATE TABLE IF NOT EXISTS nauczyciele (idNauczyciela INTEGER PRIMARY KEY, imieNauczyciela VARCHAR(30), nazwiskoNauczyciela VARCHAR(30));");
    };
    //dodawanie rekordow
    function dodaj_rekord(tx) {
        var mainTemp = 0;
        //tabela glowna
        for (var a = 1; a <= 5; a++) {
            for (var b = 1; b <= 14; b++) {
                mainTemp++;
                tx.executeSql("INSERT INTO glowna (id, numerSali, kluczObcyDnia, kluczObcyGodziny, kluczObcyPrzedmiotu, kluczObcyNauczyciela) VALUES (" + mainTemp + ", '--', " + a + ", " + b + ", 0, 0);");
            }
        }                
        //tabela dni
        for (var a = 1; a <= localDni.length; a++) {
            tx.executeSql("INSERT INTO dni (idDnia, nazwaKrotkaDnia, nazwaDlugaDnia) VALUES (" + a + ", '" + localDni[a - 1].krotka + "', '" + localDni[a - 1].dluga + "');");
        }        
        //tabela przedmioty   
        for (var a = 0; a < resetNauczyciele.length; a++) {
            tx.executeSql("INSERT INTO przedmioty (idPrzedmiotu, nazwaKrotkaPrzedmiotu, nazwaDlugaPrzedmiotu) VALUES (" + a + ", '" + resetPrzedmioty[a].krotka + "','" + resetPrzedmioty[a].dluga + "');");
        }
        //tabela nauczyciele
        for (var a = 0; a < resetPrzedmioty.length; a++) {
            tx.executeSql("INSERT INTO nauczyciele (idNauczyciela, imieNauczyciela, nazwiskoNauczyciela) VALUES (" + a + ", '" + resetNauczyciele[a].imie + "','" + resetNauczyciele[a].nazwisko + "');");
        }
        //tabela godziny
        for (var a = 1; a <= 14; a++) {
            tx.executeSql("INSERT INTO godziny (idGodziny, godzinaOd, minutaOd, godzinaDo, minutaDo) VALUES (" + a + ", '--', '--', '--', '--');");
        }
    };
    //operacja slq przebiegla pomyslnie
    function onSuccess() {
        setTimeout(function () {
            alert("SQL Success");
        }, 0);

    };
    //operacja sql przebiegla niepomyslnie
    function onError(tx, error) {
        setTimeout(function () {
            alert("SQL Error: " + error.message);
        }, 0);
    };
    //==========================================TWORZENIE I WYPELNIANIE BAZY DANYCH=========================================//


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
