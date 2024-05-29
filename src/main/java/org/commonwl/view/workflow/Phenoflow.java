package org.commonwl.view.workflow;

public enum Phenoflow {
  URL("https://kclhi.org/phenoflow"),
  GITHUB_URL("github.com/phenoflow"),
  GITHUB_API_URL("https://api.github.com");

  private final String address;

  Phenoflow(String address) {
    this.address = address;
  }

  @Override
  public String toString() {
    return address;
  }
}
