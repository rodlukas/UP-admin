Feature: Login and logout

  Background: Prepared database
    Given the database with user

  @login @login_logout @fast.row1.1
  Scenario: Login to app with correct credentials
    When user logs into app with correct credentials
    Then user is logged into app

  @login @login_logout
  Scenario: Login to app with wrong credentials
    When user logs into app with wrong credentials
    Then user is not logged into app

  @logout @login_logout @fast.row1.1
  Scenario: Logout from app
    Given the logged user
    When user logs out of app
    Then user is logged out of app

  # bez prihlaseni nema UI co ukazat; krok je jen v API stage
  @login_logout @api_only
  Scenario: Anonymous request is rejected
    When user requests the client list without logging in
    Then the request is rejected as unauthorized
