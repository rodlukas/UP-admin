Feature: Login and logout

  Background: Prepared database
    Given the database with user

  @login_logout @login
  Scenario: Login to app with correct credentials
    When user logs into app with correct credentials
    Then user is logged into app

  @login_logout @login
  Scenario: Login to app with wrong credentials
    When user logs into app with wrong credentials
    Then user is not logged into app

  @login_logout @logout
  Scenario: Logout from app
    Given the logged user
    When user logs out of app
    Then user is logged out of app
