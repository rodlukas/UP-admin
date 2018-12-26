Feature: Login and logout

  Background: Prepared database
    Given the database with user

  @login
  Scenario: Login to app
    When user logs into app
    Then user is logged into app

  @logout
  Scenario: Logout from app
    Given the logged user
    When user logs out of app
    Then user is logged out of app
