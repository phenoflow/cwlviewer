package org.commonwl.view.workflow;

public enum Phenoflow {
  URL("http://localhost:3003/phenoflow"),
  GITHUB_URL("phenoflow-proxy-1/git/phenoflow"),
  GITHUB_API_URL("http://phenoflow-proxy-1/git/api/v1"),
  DEFAULT_BRANCH("read-potential-cases-fhir");

  private final String address;

  Phenoflow(String address) {
    this.address = address;
  }

  @Override
  public String toString() {
    return address;
  }
}
