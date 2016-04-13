Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true,
  forceUsernameLowercase: true,
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'first-name',
        fieldLabel: 'First name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
        }
    },{
      fieldName: 'type',
      fieldLabel: 'Type',
      inputType: 'select',
      visible: true,
      empty: 'Please select your service type',
      data: [{
        id: 1,
        label: 'Driver',
        value: 'driver'
      },{
        id: 2,
        label: 'Passenger',
        value: 'passenger'
      }],
      validate: function(value, errorFunction){
        if(!value){
          errorFunction("Please select a service type to proceed");
          return false;
        }else{
          return true;
        }
      }

    }]
});
