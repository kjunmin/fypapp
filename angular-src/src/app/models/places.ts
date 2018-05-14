export class PlaceMarker {

    private google:any;

    createInfoWindow(marker, position) {
        var info = new google.maps.InfoWindow({
          content: "<div class='tweet-window-container'> \
                      <ul class='list-group'> \
                          <li class='list-group-item'><h5>Name:</h5> " + marker.name + "</li> \
                          <li class='list-group-item'><h5>Image:</h5> " + marker.reference + "</li> \
                          <li class='list-group-item'><h5>Address:</h5> " + marker.vicinity + "</li> \
                      </ul> \
                  </div>",
          position: position,
          disableAutoPan: true
        })
        return info;
      }
}