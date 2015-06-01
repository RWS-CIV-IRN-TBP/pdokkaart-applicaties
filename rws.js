/**
 * Namespace: Geotool.Calendar
 * Contains convenience constants and functions for calendar information.
 */
var Geotool = Geotool || {};

Geotool.version = '1.1.1'

Geotool.Calendar = {

    monthNames: [ "januari",
        "februari",
        "maart",
        "april",
        "mei",
        "juni",
        "juli",
        "augustus",
        "september",
        "oktober",
        "november",
        "december" ],

    /**
     * Format ISO date YYYYMMDD as human readable string.
     */
    formatYYYYMMDD: function(dateYYYYMMDDstr)
    {
        var year = parseInt(dateYYYYMMDDstr.substr(0, 4), 10);
        var month = parseInt(dateYYYYMMDDstr.substr(4,2),10);
        var day = parseInt(dateYYYYMMDDstr.substr(6,2),10);
        return ""+day+" "+Geotool.Calendar.monthNames[month-1]+" "+year;
    },
    /**
     * Format date in MMDD (month and day) as human readable string.
     */
    formatMMDD: function(dateMMDDstr){
        var month = parseInt(dateMMDDstr.substr(0,2),10);
        var day = parseInt(dateMMDDstr.substr(2,2),10);
        return ""+day+" "+Geotool.Calendar.monthNames[month-1];
    },
    formatAsTime: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getHours()+':'+(d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    },
    formatAsDate: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getDate()+'/'+(d.getMonth() + 1);
    },
    formatAsLongDate: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getDate()+'-'+(d.getMonth()+1) + '-' + d.getFullYear();
    },
    formatAsLongUSDate: function(timestampInSeconds){
        var d = new Date(timestampInSeconds*1000);
        return d.getFullYear()+'-'+(d.getMonth() < 10 ? '0' : '')+(d.getMonth()+1) + '-' +(d.getDate() < 10 ? '0' : '')+d.getDate();
    }
}

Geotool.icons = {
    label_1:{url:'../img/label_1.png', width:29, height:23},
    label_2:{url:'../img/label_2.png', width:29, height:23},
    label_3:{url:'../img/label_3.png', width:29, height:23},
    label_4:{url:'../img/label_4.png', width:29, height:23},
    label_5:{url:'../img/label_5.png', width:29, height:23},
    label_1_xl:{url:'../img/label_1_xl.png', width:44, height:23},
    label_2_xl:{url:'../img/label_2_xl.png', width:44, height:23},
    label_5_xl:{url:'../img/label_5_xl.png', width:44, height:23}
}


/**
 * Retrieve JSON waterdata from url, create features for them and place them on the map in the featuresLayer
 *
 * @param data_uri: String url to retrieve the JSON feature(!) data to view as features on the map
 *
 * The returned data is an object with a property 'features' containing an array of features, for example
 * http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/?mode=features&projecttype=windsnelheden_en_windstoten&loadprojects=1

     {  "locatienaam":"North Cormorant",
        "parameternaam":"Windsnelheid",
        "par":"WC10",
        "loc":"NC1",
        "net":"LMW",
        "waarde":"12.9",
        "eenheid":"m\/s",
        "category":1,
        "iconnr":1,
        "popupsize":"600",
        "graphsize":"550",
        "waardeh10a":null,
        "waardeh10v":null,
        "waardeq10v":null,
        "iconsubscript":"13:10 uur",
        "meettijd":"1427116200",
        "link_wn":null,
        "ids":["NC1LMWWC10"],
        "location":{"lat":"1494693","lon":"-72282"},
        "categoryDescription":"Windsnelheden en windstoten",
        "icon":{}
      }
 *
 * @param featuresLayer: vector layer used to place the features in
 * @param projecttype: String used in the table and graph url's in the popups. eg 'waterstanden'
 * @param categories: Array of integers, containing the 'category'-values that you want to show on the map.
 *                      waterdata uri features contain a category, and sometimes one data url contains several
 *                      categories or thema's, which you want to 'filter' for your map
 * @param icons: Array of objects, containing an icon path for every 'iconnr' available in the data, eg:
 *                [{},Geotool.icons.label_1,Geotool.icons.label_2,Geotool.icons.label_3,Geotool.icons.label_4]
 *                for data having iconnr values 1,2,3 and 4
 * @param params: Array of strings, containing the parameters which have to be shown in the table in the feature popup
 *                Every param (eg Th0_B2) has it's own column in that table
 *                Eg, the windsnelheden_en_windstoten data:
 *                 http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=P11&net=LMW&projecttype=windsnelheden_en_windstoten&category=1
 *                has WC10 and WC10MXS3
 */

Geotool.getWaterData = function(data_uri, featuresLayer, projecttype, categories, icons, params){

    if (icons == undefined){
        icons = [Geotool.icons.label_1,
            Geotool.icons.label_1,
            Geotool.icons.label_1,
            Geotool.icons.label_1,
            Geotool.icons.label_1,
            Geotool.icons.label_1];
    }
    function handler(request) {
        var obj = JSON.parse(request.responseText);
        var features = [];
        var  labelYOffset = 2;  // FF, Chrome etc
        if (navigator.appVersion.indexOf('MSIE 10')>=0 || navigator.userAgent.indexOf('Trident')>=0) {
            labelYOffset = -1;  // IE >= 10
        }
        for (var i=0;i<obj.features.length;i++) {
        //for (var i=0;i<30;i++) {
            var data = obj.features[i];
            // ONLY features from categories (thema's) will be shown/added
            //console.log(data.category, data.iconnr)
            var waarde = (data.waarde == null ? '---' : (data.waarde > 0 ? '' + data.waarde : data.waarde));
            if (OpenLayers.Util.indexOf(categories, data.category)>=0) {
                var feature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(data.location.lon, data.location.lat),
                    data,
                    {
                        externalGraphic: icons[data.iconnr].url,
                        graphicWidth: icons[data.iconnr].width,
                        graphicHeight: icons[data.iconnr].height,
                        labelXOffset: "0",
                        labelYOffset: labelYOffset,
                        fillOpacity: 1,
                        label: waarde,
                        labelSelect: true,   // IMPORTANT, else not clickable in IE !!
                        fontColor: "#ffffff",
                        fontSize: "9px",
                        fontFamily: "Arial,Helvetica,sans-serif;"
                    }
                );
                // setting some special members here being used when user clicks on the feature
                // the popup will need this info te create a data and grafiek url
                feature.projecttype = projecttype;
                feature.category = data.category;
                feature.params = params;
                features.push(feature);
            }
        }
        // close popups
        while( featuresLayer.map.popups.length ) {
            featuresLayer.map.removePopup(featuresLayer.map.popups[0]);
        }
        // remove all features in featuresLayer, so we can run this method every 5 minutes
        featuresLayer.removeAllFeatures();
        // now add the new ones
        featuresLayer.addFeatures(features);
        if (featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')){
            featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')[0].decreaseCounter();
        }
    }
    // requests take some time sometimes
    if (featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')){
            featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')[0].increaseCounter();
        }
    var request = OpenLayers.Request.GET({
        url: data_uri,
        callback: handler
    });

}

Geotool.graphtableswitch = function(div) {

    // use querySelectorAll instead of getElementsByClass here to be IE8 compliant !!
    if (div.innerHTML[0]=='T') {
        document.querySelectorAll('.table')[0].style.display = 'block';
        document.querySelectorAll('.graph')[0].style.display = 'none';
        div.innerHTML='Grafiek <img src="../img/grafiek.gif"/>';
    }
    else{
        document.querySelectorAll('.table')[0].style.display = 'none';
        document.querySelectorAll('.graph')[0].style.display = 'block';
        div.innerHTML='Tabel <img src="../img/tabel.gif"/>';
    }
}

Geotool.createWaterPopup = function(f) {

    if (!f) {
        return false;
    }

    // create popup with visible graph
    var waarde = (f.data.waarde == null ? '---' : (f.data.waarde > 0 ? '' + f.data.waarde : f.data.waarde));
    // categoryDescription or parameternaam, some datasets have both, some have one of them :-(
    var paramname = f.data.categoryDescription;
    if (paramname == undefined){
        paramname = f.data.parameternaam;
    }
    f.attributes['name'] = '<b>' + paramname +': ' + waarde + ' ' + f.data.eenheid + '</b>';

    var graph_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=grafiek&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category;
    var table_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category;

    var meettijd = Geotool.Calendar.formatAsLongDate(f.data.meettijd)  + ' - ' +  Geotool.Calendar.formatAsTime(f.data.meettijd) + '&nbsp;uur';

    var html = '<div id="description"><p>'+meettijd+ ' - ' + f.data.locatienaam+'</p></div>';
    html += '<div class="graph" style="display:block;"><img src="' + graph_url + '" alt="Grafiek wordt opgehaald..."/></div>';
    html += '<div class="table" style="display:none;">Data ophalen...</div>';
    html += '<div class="graphtablebtn" onclick="Geotool.graphtableswitch(this)">Tabel <img src="../img/tabel.gif"/></div>';

    f.attributes['description'] = html;

    // retrieve the data needed for the table
    var request = OpenLayers.Request.GET({
        url: table_url,
        callback: function(request){

            var obj = JSON.parse(request.responseText);

            //console.log(obj);

            var params = f.params;

            // creating a 'table' object,
            // with a 'row'-object for every timestamp ('tijd')
            // which get's 'record'-attributes for every param
            // eg given 'WC10' and 'WC10MXS3' as params:
            // table = {
            //          '1426633200': {'WC10':{data}, 'WC10MXS3':{data}},
            //          '1426633800': {'WC10':{data}, 'WC10MXS3':{data}}
            //          etc
            //          }
            var table = {};
            var timestamps = [];
            for (var i=0; i<params.length;i++) {
                var param = params[i].key;
                if (obj[param]) { // some dataset have different parameters within their feature (waterhoogte etc)
                    for (var j = 0; j < obj[param].length; j++) {
                        var row = obj[param][j];
                        var timestamp = obj[param][j]['tijd'];  // string like '1426633800'
                        if (table[timestamp] == undefined) {
                            table[timestamp] = {};
                            timestamps.push(timestamp);
                        }
                        table[timestamp][param] = obj[param][j];
                    }
                }
            }
            // sort all available timestamps
            timestamps = timestamps.sort();

            //console.log(table)

            var html = '';
            // we check datumdag and datumtijd for every parameter, because we never know WHICH param is available at this timestamp
            var datumdag;
            var datumtijd;
            // max three params in one table (at this moment)
            var param0, param1, param2;
            var param0value='';
            var param1value='';
            var param2value='';
            var param0name='';
            var param1name='';
            var param2name='';
            var param0units='';
            var param1units='';
            var param2units='';
            function checkValue(val){
                if (val == null || val == undefined){
                    return '-'
                }
                else {
                    return val
                }
            }
            for (var i=timestamps.length-1;i>=0;i--){
                var timestamp = timestamps[i];
                var clazz = 'roweven';
                if(i%2==1){clazz='rowodd'}
                if (params[0]) {
                    param0 = params[0].key;
                    // IF there is data for this timestamp for this param
                    if (table[timestamp][param0]) {
                        param0value = checkValue(table[timestamp][param0].waarde);
                        datumdag = table[timestamp][param0].datumdag;
                        datumtijd = table[timestamp][param0].datumtijd;
                        param0name = params[0].name;
                        param0units = params[0].units;
                    }
                }
                if (params[1]){
                    param1 = params[1].key;
                    if(table[timestamp][param1]) {
                        param1value = checkValue(table[timestamp][param1].waarde);
                        datumdag = table[timestamp][param1].datumdag;
                        datumtijd = table[timestamp][param1].datumtijd;
                        param1name = params[1].name;
                        param1units = params[1].units;

                    }
                }
                if (params[2]){
                    param2 = params[2].key;
                    if(table[timestamp][param2]) {
                        param2value = checkValue(table[timestamp][param2].waarde);
                        datumdag = table[timestamp][param2].datumdag;
                        datumtijd = table[timestamp][param2].datumtijd;
                        param2name = params[2].name;
                        param2units = params[2].units;
                    }
                }
                html+='<tr class='+clazz+'><td>'+datumdag+'</td><td>'+datumtijd+'</td><td>'+param0value+'</td><td>'+param1value+'</td><td>'+param2value+'</td></tr>';
            }
            html = '<table cellspacing="0" style="width:400px;">'+
                '<thead>' +
                    '<tr><th class="rowlabel" colspan="2">&nbsp;</th><th class="rowlabel">'+param0name+'</th><th class="rowlabel">'+param1name+'</th><th class="rowlabel">'+param2name+'</th></tr>' +
                    '<tr><th class="rowlabel">dag</th><th class="rowlabel">&nbsp;tijd&nbsp;</th><th class="rowlabel">'+param0units+'</th><th class="rowlabel">'+param1units+'</th><th class="rowlabel">'+param2units+'</th></tr>' +
                '</thead>'+
                '<tbody>' + html;

            html+='</tbody></table>';

            document.querySelectorAll('.table')[0].innerHTML = html;
        }
    });

    return true;
}


/**
 * Overriding the PDOK's onPopupFeatureSelect to be able to squeeze in the createWaterPopup on a select.
 * This way we do not do all the creation of those popups before hand, but only on a select.
 *
 * @param evt
 */
Pdok.Api.prototype.onPopupFeatureSelect = function(evt) {

    feature = evt.feature;

    if (Geotool.useWaterPopup) {
        Geotool.createWaterPopup(feature);
    }

    var content = "";
    if (feature.attributes['name']){
        content=feature.attributes['name'];
    }
    if (feature.attributes['description']){
        content=content+"<br/>"+feature.attributes['description'];
    }
    if (!content || content.length === 0) {
        content = '&nbsp;';
    }
    // first try: get it from the mouseclick from the MousePosition control (NOT working on touch devices)
    var popupLoc = this.map.getLonLatFromPixel(this.map.getControlsByClass("OpenLayers.Control.MousePosition")[0].lastXy);
    // second try: see if this is a point geometry with an x and an y
    if (popupLoc == null && feature.geometry && feature.geometry.x && feature.geometry.y) {
        popupLoc = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
    }
    // if still null (non point geometries?): try the center of bbox of geometry
    if (popupLoc == null){
        // try to get a click from mouse control (not working on touch devices)
        popupLoc = feature.geometry.getBounds().getCenterLonLat();
    }
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
                popupLoc,
                new OpenLayers.Size(100,100),
                content,
                null, true, function(evt) {
                    this.hide();
                    // deselect ALL features to be able to select this one again
                    popup.feature.layer.selectedFeatures=[];
                }
            );
    feature.popup = popup;
    popup.feature = feature;
    this.map.addPopup(popup, true);
};

/**
 * VERY simple legend: just one image
 *
 * @param map map to attach legend to
 * @param url url of image
 */
Geotool.legend = function(map, url){
    var legend = document.createElement('div');
    legend.setAttribute('id', 'legend');
    var legend_head = document.createElement('div');
    legend_head.setAttribute('id', 'legend_head');
    legend_head.innerHTML = 'Legenda';
    var legend_toggle = document.createElement('span');
    legend_toggle.setAttribute('id', 'legend_toggle');
    legend_toggle.innerHTML = '+';
    var legend_img = document.createElement('img');
    legend_img.setAttribute('id', 'legend_img');
    legend_img.setAttribute('src', url);
    legend.appendChild(legend_head);
    legend.appendChild(legend_toggle);
    legend.appendChild(legend_img);
    map.div.appendChild(legend);
    legend_img.pdokIsVisible = false;
    legend_head.onclick = function() {
        var legendImage = document.getElementById("legend_img");
        var legendToggle = document.getElementById("legend_toggle");
        if (legendImage.pdokIsVisible) {
            legendImage.style.display = "none";
            legendImage.pdokIsVisible = false;
            legendToggle.innerHTML = '+';
        } else {
            legendImage.style.display = "block";
            legendImage.pdokIsVisible = true;
            legendToggle.innerHTML = '-';
        }
    }
    legend_toggle.onclick = legend_head.onclick;
}

/**
 * generic Geotool ready function, called after Pdok.ready is finished (as callback)
 * to be used for some general rws functions, like renaming layers, etc
 */
Geotool.ready = function(api) {

    // add rws permalink
    var permalinkControl = new OpenLayers.Control.Permalink();
    api.map.addControl(permalinkControl);
    permalinkControl.element.innerHTML='<img src="../img/permalink.gif">';

    // change pdok names to rws names
    if (api.map.getLayersByName("BRT Achtergrondkaart (WMTS)").length>0) {
        api.map.getLayersByName("BRT Achtergrondkaart (WMTS)")[0].setName("Kaartweergave");
    }
    if(api.map.getLayersByName("PDOK achtergrond luchtfoto\'s (WMTS)").length>0){
        api.map.getLayersByName("PDOK achtergrond luchtfoto\'s (WMTS)")[0].setName("Luchtfoto");
    }
}
