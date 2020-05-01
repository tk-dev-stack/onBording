export const commonService = {

    ConvertStringToByteArray,removeFocus
}




function ConvertStringToByteArray(value) {


    var str = value
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(value.charCodeAt(i))
    }
    let bytelength = (bytes.length).toString()
    var appendcode = bytelength.charCodeAt(0)
    bytes.splice(0, 0, appendcode)
    bytes.splice(bytes.length, 0, appendcode)
    var reversearry = bytes.reverse()
    return reversearry
  }

  function removeFocus(obj,e){
    if(e.key=='Enter'){
        return obj.input.blur()
    }
  }