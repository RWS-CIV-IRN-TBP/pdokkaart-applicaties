/**
 * Namespace: Geotool.Calendar
 * Contains convenience constants and functions for calendar information.
 */
var Geotool = Geotool || {};

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
    }
}

Geotool.icons = {
    label_1:{url:'../img/label_1.png', width:29, height:23},
    label_2:{url:'../img/label_2.png', width:29, height:23},
    label_3:{url:'../img/label_3.png', width:29, height:23},
    label_4:{url:'../img/label_4.png', width:29, height:23},
    label_5:{url:'../img/label_5.png', width:29, height:23},
    label_1_xl:{url:'../img/label_1_xl.png', width:44, height:23},
    label_2_xl:{url:'../img/label_2_xl.png', width:44, height:23}
}

Geotool.getWaterData = function(data_uri, featuresLayer, projecttype, categories, icons){

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
                        labelYOffset: "2",
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
                features.push(feature);
            }
         }
         featuresLayer.addFeatures(features);
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

    //console.log(f)

    // create popup with visible graph
    var waarde = (f.data.waarde == null ? '---' : (f.data.waarde > 0 ? '' + f.data.waarde : f.data.waarde));
    f.attributes['name'] = '<b>' + f.data.parameternaam +': ' + waarde + ' ' + f.data.eenheid + '</b><br/>';

    var graph_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=grafiek&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category;
    var table_url = 'http://www.rijkswaterstaat.nl/apps/geoservices/rwsnl/awd.php?mode=data&loc=' + f.data.loc + '&net=' + f.data.net + '&projecttype='+ f.projecttype+'&category='+ f.category;
    var meettijd = Geotool.Calendar.formatAsTime(f.data.meettijd) + '&nbsp;uur - ' + Geotool.Calendar.formatAsLongDate(f.data.meettijd);
    var html = '<div id="description"><p></p>'+meettijd+ ' - ' + f.data.locatienaam+'</p></div>';
    html += '<div class="graph" style="display:block;"><img src="' + graph_url + '" alt="Grafiek wordt opgehaald..."/></div>';
    html += '<div class="table" style="display:none;">Data ophalen...</div>';
    html += '<div class="graphtablebtn" onclick="Geotool.graphtableswitch(this)">Tabel <img src="../img/tabel.gif"/></div>';

    f.attributes['description'] = html;

    // retrieve the data needed for the table
    var request = OpenLayers.Request.GET({
        url: table_url,
        callback: function(request){

            var obj = JSON.parse(request.responseText);

            // parameternaam of categoryDescription ??
            var html = '<table cellspacing="0" style="width:400px;">'+
                '<thead>' +
                    '<tr><th class="rowlabel" colspan="2">&nbsp;</th><th class="rowlabel">&nbsp;</th><th class="rowlabel">'+f.data.parameternaam+'</th></tr>' +
                    '<tr><th class="rowlabel">dag</th><th class="rowlabel">&nbsp;tijd&nbsp;</th><th class="rowlabel">&nbsp;</th><th class="rowlabel">'+ f.data.eenheid+'</th></tr>' +
                '</thead>'+
                '<tbody>';
            var records = obj[f.data.par];
            for (var i=records.length-1;i>=0;i--){
                var row = records[i];
                var clazz = 'roweven';
                if(i%2==1){clazz='rowodd'}
                html+='<tr class='+clazz+'><td>'+row.datumdag+'</td><td>'+row.datumtijd+'</td><td></td><td>'+row.waarde+'</td></tr>';
            }
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

    Geotool.createWaterPopup(feature);

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
    var popupLoc = this.map.getLonLatFromPixel(this.map.getControlsByClass("OpenLayers.Control.MousePosition")[0].lastXy);
    //alert(popupLoc);
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
