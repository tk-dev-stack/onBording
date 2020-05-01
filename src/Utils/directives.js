import React from 'react'

 class Directives  {
  

  static  handlenumberKeyPress = evt => {
        evt = evt ? evt : window.event;
        var charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          evt.preventDefault();
        }
      };
    
    render() {
        return (
            <div>
                
            </div>
        )
    }

    static  alphaNumeric = (e) => {
      const re = /[0-9a-zA-Z ]+/g;
      if (!re.test(e.key)) {
        e.preventDefault();
      }
    }

  static  onlyAlpha = evt => {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
  
      if (
        charCode > 31 &&
        (charCode < 65 || charCode > 90) &&
        (charCode < 97 || charCode > 122)
      ) {
        evt.preventDefault();
      }
    };
}

export default Directives
