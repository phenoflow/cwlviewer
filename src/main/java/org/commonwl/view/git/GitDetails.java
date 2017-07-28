/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.commonwl.view.git;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Represents all the parameters necessary to access a file/directory with Git
 */
@JsonIgnoreProperties(value = {"internalUrl"})
public class GitDetails implements Serializable {

    private String repoUrl;
    private String branch;
    private String path;

    public GitDetails(String repoUrl, String branch, String path) {
        this.repoUrl = repoUrl;

        // Default to the master branch
        if (branch == null || branch.isEmpty()) {
            // TODO: get default branch name for this rather than assuming master
            this.branch = "master";
        } else {
            this.branch = branch;
        }

        // Default to root path
        if (path == null || path.isEmpty()) {
            this.path = "/";
        } else {
            this.path = path;
        }
    }


    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    /**
     * Get the type of a repository URL this object refers to
     * @return The type for the URL
     */
    public GitType getType() {
        try {
            URI uri = new URI(repoUrl);
            String domain = uri.getHost();
            if (domain.startsWith("www.")) {
                domain = domain.substring(4);
            }
            switch (domain) {
                case "github.com":
                    return GitType.GITHUB;
                case "gitlab.com":
                    return GitType.GITLAB;
                case "bitbucket.org":
                    return GitType.BITBUCKET;
                default:
                    return GitType.GENERIC;
            }
        } catch (URISyntaxException ex) {
            return GitType.GENERIC;
        }
    }

    /**
     * Get the URL to the external resource representing this workflow
     * @param branchOverride The branch to use instead of the one in this instance
     * @return The URL
     */
    public String getUrl(String branchOverride) {
        switch (getType()) {
            case GITHUB:
            case GITLAB:
                return "https://" + normaliseUrl(repoUrl).replace(".git", "")
                        + "/blob/" + branchOverride + "/" + path;
            case BITBUCKET:
                return "https://" + normaliseUrl(repoUrl).replace(".git", "")
                        + "/src/" + branchOverride + "/" + path;
            default:
                return repoUrl;
        }
    }

    /**
     * Get the URL to the external resource representing this workflow
     * @return The URL
     */
    public String getUrl() {
        return getUrl(branch);
    }

    /**
     * Get the URL to the page containing this workflow
     * @return The URL
     */
    public String getInternalUrl() {
        switch (getType()) {
            case GITHUB:
            case GITLAB:
                return "/workflows/" + normaliseUrl(repoUrl).replace(".git", "") + "/blob/" + branch + "/" + path;
            default:
                return "/workflows/" + normaliseUrl(repoUrl) + "/" + branch + "/" + path;
        }
    }

    /**
     * Get the URL directly to the resource
     * @return The URL
     */
    public String getRawUrl() {
        switch (getType()) {
            case GITHUB:
                return "https://raw.githubusercontent.com/" +
                        normaliseUrl(repoUrl).replace("github.com/", "").replace(".git", "") +
                        "/" + branch + "/" + path;
            case GITLAB:
            case BITBUCKET:
                return "https://" + normaliseUrl(repoUrl).replace(".git", "")
                        + "/raw/" + branch + "/" + path;
            default:
                return repoUrl;
        }
    }

    /**
     * Normalises the URL removing protocol and www.
     * @param url The URL to be normalised
     * @return The normalised URL
     */
    public static String normaliseUrl(String url) {
        return url.replace("http://", "")
                  .replace("https://", "")
                  .replace("ssh://", "")
                  .replace("git://", "")
                  .replace("www.", "");
    }

}