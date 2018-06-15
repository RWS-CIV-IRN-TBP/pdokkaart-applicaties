/**
 * Namespace: Geotool.Calendar
 * Contains convenience constants and functions for calendar information.
 */
var Geotool = Geotool || {};

Geotool.version = '1.2.4'

// RWS proxy (needed for WFS and cross domain requests)
OpenLayers.ProxyHost='https://geoservices.rijkswaterstaat.nl/apps/pdokkaart/proxy.ashx?'

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
        return d.getFullYear()+'-'+(d.getMonth()+1 < 10 ? '0' : '')+(d.getMonth()+1) + '-' +(d.getDate() < 10 ? '0' : '')+d.getDate();
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
        var popupId = false;
        if (OpenLayers.Util.getParameters().popupid){
            popupId = OpenLayers.Util.getParameters().popupid;
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
        // if there was a popupid in the parameters, get it and show the popup
        if (popupId){
            featuresLayer.map.getControlsByClass("OpenLayers.Control.SelectFeature")[0].select(
                    featuresLayer.getFeaturesByAttribute("ids", popupId)[0])
        }
    }

    // requests take some time sometimes
    if (featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')){
            featuresLayer.map.getControlsByClass('OpenLayers.Control.LoadingPanel')[0].increaseCounter();
        }
    var request = OpenLayers.Request.GET({
        url: data_uri+'#'+new Date().getTime(),
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
    // we add a #timestamp to the url to be sure the images are updated in a popup every refresh time
    var graph_url = 'https://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=grafiek&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category+'#'+new Date().getTime();
    var table_url = 'https://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category+'#'+new Date().getTime();
    var meettijd = Geotool.Calendar.formatAsLongDate(f.data.meettijd)  + ' - ' +  Geotool.Calendar.formatAsTime(f.data.meettijd) + '&nbsp;uur';

    var html = '<div id="description"><p>'+meettijd+ ' - ' + f.data.locatienaam+'</p></div>';
    html += '<div class="graph" style="display:block;"><a target="graph" href="'+graph_url+'"><img src="' + graph_url + '" alt="Grafiek wordt opgehaald..."/></a></div>';
    html += '<div class="table" style="display:none;">Data ophalen...</div>';
    html += '<div class="graphtablebtn" onclick="Geotool.graphtableswitch(this)">Tabel <img src="../img/tabel.gif"/></div>';

    f.attributes['description'] = html;

    // retrieve the data needed for the table
    var request = OpenLayers.Request.GET({
        url: table_url,
        callback: function(request){
            var obj = JSON.parse(request.responseText);
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
            var html = '';
            function checkValue(val){
                if (val == null || val == undefined){
                    return '-'
                }
                else {
                    return val
                }
            }
            var param0name='';
            var param1name='';
            var param2name='';
            for (var i=timestamps.length-1;i>=0;i--){
                // we check datumdag and datumtijd for every parameter, because we never know WHICH param is available at this timestamp
                var datumdag;
                var datumtijd;
                // max three params in one table (at this moment)
                var param0, param1, param2;
                var param0value='';
                var param1value='';
                var param2value='';
                var param0units='';
                var param1units='';
                var param2units='';
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
            if (document.querySelectorAll('.table').length>0) {
                document.querySelectorAll('.table')[0].innerHTML = html;
            }
        }
    });

    return true;
}

/**
 * Method to give a getWaterData function, and it keeps calling this function for given interval
 * Needed to keep updating the waterdata
 */
// interval time in milliseconds
Geotool.dataInterval = 5*60*1000;

Geotool.refreshData = function(fnc) {
    fnc(); // call function NOW
    return(setInterval(fnc, Geotool.dataInterval)); // keep calling it every dataInterval milliseconds
}

/**
 * Overriding the PDOK's onPopupFeatureSelect to be able to squeeze in the createWaterPopup on a select.
 * This way we do not do all the creation of those popups before hand, but only on a select.
 *
 * @param evt
 */
Pdok.Api.prototype.onPopupFeatureSelect = function(evt) {

    feature = evt.feature;
    //console.log(feature)

    if (Geotool.useWaterPopup) {
        Geotool.createWaterPopup(feature);
        this.map.getControlsByClass("OpenLayers.Control.Permalink")[0].updateLink();
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

    var popupLoc = Geotool.getPopupLoc(feature, this.map);
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
                popupLoc,
                new OpenLayers.Size(100,100),
                content,
                null,
                true,
                function(evt) {   // closing function !
                    // deselect ALL features to be able to select this one again
                    popup.feature.layer.selectedFeatures=[];
                    this.hide();
                    popup.map.getControlsByClass("OpenLayers.Control.Permalink")[0].updateLink(true);
                    Geotool.toggleControls(popup.map, true);
                }
            );
    feature.popup = popup;
    popup.feature = feature;
    this.map.addPopup(popup, true);
    Geotool.toggleControls(popup.map, false);
    this.map.getControlsByClass("OpenLayers.Control.Permalink")[0].updateLink();
};

/**
 * Overriding Map's removePopup so we can update the permalink
 * NOTE: closing the popup is done in two ways: via removePopup and via the closing function above
 * @param popup
 */
OpenLayers.Map.prototype.removePopup = function(popup) {
    OpenLayers.Util.removeItem(this.popups, popup);
    if (popup.div) {
        try { this.layerContainerDiv.removeChild(popup.div); }
        catch (e) { } // Popups sometimes apparently get disconnected
                  // from the layerContainerDiv, and cause complaints.
    }
    popup.map = null;
    // only line below is custom
    if (this.getControlsByClass("OpenLayers.Control.Permalink")[0]) {
        this.getControlsByClass("OpenLayers.Control.Permalink")[0].updateLink(true);
    }
    Geotool.toggleControls(this, true);
}

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
 * Generic function to find out the location of a Geotool Popup, based on the feature from the
 * click/touch event, of if that fails try to get it from the last mouse position.
 * @param map current map
 * @param feature feature from event
 * @return a OpenLayers.LonLat object
 */
Geotool.getPopupLoc = function(feature, map) {

    // first (faulty) try: get it from the mouseclick from the MousePosition control (NOT working on touch devices)
    var popupLoc = map.getLonLatFromPixel(map.getControlsByClass("OpenLayers.Control.MousePosition")[0].lastXy);

    // second better try: see if this is a point geometry with an x and an y
    if (//popupLoc == null &&
            feature.geometry && feature.geometry.x && feature.geometry.y) {
        popupLoc = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
    }
    // if still null (non point geometries?): try the center of bbox of geometry
    if (popupLoc == null){
        popupLoc = feature.geometry.getBounds().getCenterLonLat();
    }
    // still null?
    if (popupLoc == null){ alert("popup without anchor location ???!!!") }

    return popupLoc;
}

/**
 * Overriding the OpenLayers.Layer.Vector.getFeaturesByAttribute function because the rws attribute values
 * (actually ID's) are sometimes arrays, like 'ids':["MAASLMWH10"] and we need this to be able to find the
 * feature to open the window
 */
OpenLayers.Layer.Vector.prototype.getFeaturesByAttribute = function(attrName, attrValue) {
    var i,
        feature,
        len = this.features.length,
        foundFeatures = [];
    for(i = 0; i < len; i++) {
        feature = this.features[i];
        if(feature && feature.attributes) {
            if (feature.attributes[attrName] === attrValue ||
                feature.attributes[attrName] instanceof Array && feature.attributes[attrName].indexOf(attrValue)>=0 ) {
                foundFeatures.push(feature);
            }
        }
    }
    return foundFeatures;
}

/**
 * Overriding draw function of permalink to be able to draw our own button + input
 */
OpenLayers.Control.Permalink.prototype.draw = function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        if (!this.element && !this.anchor) {

            this.element = document.createElement("a");
            this.element.innerHTML = OpenLayers.i18n("Permalink");
            this.element.href="";
            this.wrapper = document.createElement("div");
            this.wrapper.appendChild(this.element);
            this.div.appendChild(this.wrapper);
            /*
            this.element = document.createElement("a");
            this.div.appendChild(this.element);
            this.element.innerHTML = '<a href="">'+OpenLayers.i18n("Permalink")+'</a>';
            */
            /*
            #permalinkdiv {
                display: block;
                background-color: #ffffff;
                border: 1px solid #000000;
                padding: 2px;
                position: absolute;
                right: 15px;
                top: 22px;
                z-index: 5000;
            }
            <div id="permalinkdiv">
                <div class="permalinkClose"><a onclick="document.getElementById('permalinkdiv').style.display = 'none'; return false;" href="#"><img border="0" title="Sluiten" src="_img/close_mini.gif"></a></div>
                <p><label><b>Kopieer de volgende link:</b><br>
                <input type="text" size="40" value="" name="permalinkinput" id="permalinkinput"></label> <br>
                </p>
            </div>
            */
            this.permalinkdiv = document.createElement("div");
            this.permalinkdiv.id = "permalinkdiv";
            var html =
                //'<div class="permalinkClose">'+'<a onclick="document.getElementById(\'permalinkdiv\').style.display = \'none\'; return false;" href="#"><img border="0" title="Sluiten" src="_img/close_mini.gif"></a></div>'+
                '<p><label><b>Kopieer de volgende link:</b><br>'+
                '<input type="text" size="40" value="" name="permalinkinput" id="permalinkinput"></label> <br>'+
                '</p>';
            this.permalinkdiv.innerHTML = html;
            //this.wrapper.appendChild(this.permalinkdiv);
            this.map.div.appendChild(this.permalinkdiv);
        }
        this.map.events.on({
            'moveend': this.updateLink,
            'changelayer': this.updateLink,
            'changebaselayer': this.updateLink,
            scope: this
        });

        // Make it so there is at least a link even though the map may not have
        // moved yet.
        this.updateLink();

        return this.div;
    }
/**
 * Overriding the updateLink function of Permalink class to add our own functionality
 */
OpenLayers.Control.Permalink.prototype.updateLink = function(cleanup) {
    var separator = this.anchor ? '#' : '?';
    var href = this.base;
    var anchor = null;
    if (href.indexOf("#") != -1 && this.anchor == false) {
        anchor = href.substring( href.indexOf("#"), href.length);
    }
    if (href.indexOf(separator) != -1) {
        href = href.substring( 0, href.indexOf(separator) );
    }
    var splits = href.split("#");
    var params = this.createParams();
    // or check if there is a feature popup
    if (this.map.popups.length>0 && this.map.popups[0].visible()){
        var feature = this.map.popups[0].feature;
        if (feature.attributes.ids) {
            var id = feature.attributes.ids[0];
            params.popupid = id;
        }
        else if(feature.popupxy){
            // we set a popupxy property (LatLon value) on this feature to indicate there is a getfeature popup xy
            params.popupxy = feature.popupxy.lon+","+feature.popupxy.lat;
        }
    }
    else if (cleanup===true){
        // remove a '&popupid' or '&popupxy' from query parameters if in the url (to be sure we have a good permalink)?
        delete params.popupid;
        delete params.popupxy;
    }
    href = splits[0] + separator+ OpenLayers.Util.getParameterString(params);
    if (anchor) {
        href += anchor;
    }
    if (document.getElementById("permalinkinput")) {
        document.getElementById("permalinkinput").value = href;
        // set new link also in browser location field, needed for permalink to pick up an opened popup
        if (window.history.pushState){
            // older IE doe not have this...
            window.history.pushState("", "PDOKKaart", href);
        }
    }
    return false;
}

Geotool.toggleControls = function(map, visible){
    // test: only when mapwidth < 400
    if (map.size.w <= 400) {
        var display = 'block';
        if (!visible) {
            display = 'none';
        }
        if (document.getElementById('legend')){
            document.getElementById('legend').style.display = display;
        }
        if (map.getControlsByClass("OpenLayers.Control.Permalink").length>0) {
            map.getControlsByClass("OpenLayers.Control.Permalink")[0].div.style.display = display;
        }
        if (map.getControlsByClass("OpenLayers.Control.GeocoderControl").length>0) {
            map.getControlsByClass("OpenLayers.Control.GeocoderControl")[0].div.style.display = display;
        }
        if (map.getControlsByClass("OpenLayers.Control.LayerSwitcher").length>0) {
            map.getControlsByClass("OpenLayers.Control.LayerSwitcher")[0].div.style.display = display;
        }
        if (map.getControlsByClass("OpenLayers.Control.Zoom").length>0) {
            map.getControlsByClass("OpenLayers.Control.Zoom")[0].div.style.display = display;
        }
    }
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
    permalinkControl.element.onclick = function(evt){
        api.map.getControlsByClass("OpenLayers.Control.Permalink")[0].updateLink();
        if (document.getElementById("permalinkdiv").offsetParent == null){
            // permalinkdiv is hidden currently... update and show it
            var pmcontrol = api.map.getControlsByClass("OpenLayers.Control.Permalink")[0]
            pmcontrol.updateLink();
            document.getElementById("permalinkdiv").style.display='block';
            window.setTimeout(function(){
                document.getElementById("permalinkinput").setSelectionRange(0, 2000);document.getElementById("permalinkinput").focus();
            }, 500);
        }
        else{
            // hide it
            document.getElementById("permalinkdiv").style.display='none';
        }
        return false;
    }

    // change pdok names to rws names
    if (api.map.getLayersByName("BRT Achtergrondkaart (WMTS)").length>0) {
        api.map.getLayersByName("BRT Achtergrondkaart (WMTS)")[0].setName("Kaartweergave");
    }
    if(api.map.getLayersByName("PDOK achtergrond luchtfoto\'s (WMTS)").length>0){
        api.map.getLayersByName("PDOK achtergrond luchtfoto\'s (WMTS)")[0].setName("Luchtfoto");
    }

    // rws want to have layer switcher closed at beginning
    if (api.map.getControlsByClass("OpenLayers.Control.LayerSwitcher").length>0) {
        api.map.getControlsByClass("OpenLayers.Control.LayerSwitcher")[0].minimizeControl();
    }


    // overriding the PDOK geocoder to be able to search for non default search types 'perceel' en 'hectometerpaal'
    // IF kadaster updates PDOKKaart api (and &fq=+type:* is added there...) this part can be removed
    var currentGeocoders = api.map.getControlsByClass('OpenLayers.Control.GeocoderControl');
    for (var i = 0; i < currentGeocoders.length; i++) {
        currentGeocoders[i].geocoderUrl+='&fq=+type:*';
        currentGeocoders[i].zoomScale = {
            hectometerpaal: 14,
            perceel: 14,
            adres: 13,
            postcode: 11,
            weg: 11,
            woonplaats: 8,
            gemeente: 8,
            provincie: 5,
            standaard: 9
        }

    }


}

