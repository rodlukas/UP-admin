Feature: Switching the color scheme

  Background: Prepared database
    Given the database with user

  # cistne frontendova funkce (Mantine + localStorage), bezi jen v UI stage (tag @ui_only)
  @color_scheme @ui_only
  Scenario: Switch color scheme to dark and keep it after page reload
    Given the logged user
    When user switches the color scheme to "dark"
    Then the "dark" color scheme is active
    When user reloads the page
    Then the "dark" color scheme is active
